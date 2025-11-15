package repository

import (
	"context"
	"errors"
	"fmt"
	"log"
	"stopover.backend/internal/models"
	"stopover.backend/pkg/common"

	"strings"
	"sync"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
)

func (db *DbClient) CreateUser(ctx context.Context, req models.CreateUser) (*models.CreateUserResponse, error) {
	response := &models.CreateUserResponse{}
	query := `insert into tbl_mst_user(name,email,hashed_password,role_id)values(@name,@email_id, @hashed_password,@role_id) returning user_id;`
	args := pgx.NamedArgs{
		"name":            req.Name,
		"email_id":        req.EmailId,
		"hashed_password": req.HashedPassword,
		"role_id":         req.RoleId,
	}

	tx, err := db.Conn.BeginTx(ctx, pgx.TxOptions{})
	if err != nil {
		log.Println("error beginning transaction")
		return nil, err
	}

	defer tx.Rollback(ctx)

	// create user
	var userId int64
	err = tx.QueryRow(ctx, query, args).Scan(&userId)
	if err != nil {
		var pgErr *pgconn.PgError
		if errors.As(err, &pgErr) {
			if pgErr.Code == string(common.UniqueConstraint) {
				response.Message = "Email Id already exists"
				return response, nil
			}
		}

		log.Println("CreateUser QUERY failed: " + err.Error())
		return nil, err
	}

	if userId == 0 {
		log.Println("CreateUser user creation failed ")
		return nil, errors.New("no rows affected")
	}

	// assign role to user
	query = `insert into tbl_mst_user_role(role_id,user_id) values(@role_id,@user_id)`
	args["user_id"] = userId
	resp, err := tx.Exec(ctx, query, args)
	if err != nil {
		log.Println("CreateUser QUERY failed: userrole" + err.Error())
		return nil, err
	}

	if resp.RowsAffected() == 0 {
		log.Println("CreateUser tbl_mst_user_role no rows affected")
		return nil, errors.New("no rows affected")
	}

	tx.Commit(ctx)

	response.UserId = userId
	response.Success = true
	return response, nil
}

func (db *DbClient) ListUser(ctx context.Context, req models.ListUserRequest) (*models.ListUserResponse, error) {
	response := &models.ListUserResponse{
		Users: make([]*models.UserDetails, 0),
	}

	args, listQuery, countQuery := buildListUserQuery(req)

	errChan := make(chan error, 2)
	var users []*models.UserDetails
	var count *int64

	var wg sync.WaitGroup
	wg.Add(2)

	go func() {
		defer wg.Done()
		var lqerror error
		users, lqerror = db.getUsers(ctx, listQuery, args)
		if lqerror != nil {
			errChan <- lqerror
		}
	}()

	go func() {
		defer wg.Done()
		var lqerror error
		count, lqerror = db.getUserTotalCount(ctx, countQuery, args)
		if lqerror != nil {
			errChan <- lqerror
		}
	}()

	wg.Wait()
	close(errChan)
	for err := range errChan {
		if err != nil {
			return nil, err
		}
	}

	if users != nil {
		response.Users = users
		response.TotalCount = *count
		return response, nil
	}

	return nil, nil
}

func buildListUserQuery(req models.ListUserRequest) (pgx.NamedArgs, string, string) {
	var lq strings.Builder
	var cq strings.Builder
	args := pgx.NamedArgs{}

	size := req.Pagination.PageSize
	pgNum := req.Pagination.PageNumber
	if pgNum == 0 || size == 0 {
		pgNum = 1
		size = 10
	}

	limit := size
	offset := (pgNum - 1) * size

	lq.WriteString(`with UserList as (
  select 
    user_id, 
    tmu.name, 
    email, 
    tmu.role_id, 
    tmnur.name as role_name, 
    created_at, 
    floor(
      date_part('epoch', created_at)
    ) as created_at_epoch, 
    is_blocked 
  from 
    tbl_mst_user tmu 
    left join tbl_mst_nui_user_role tmnur on tmnur.role_id = tmu.role_id
	where tmu.is_active = true 
	`)

	for _, v := range req.Pagination.SearchFilter {
		switch v.SearchColumn {
		case "name":
			lq.WriteString(` and tmu.name ilike @name`)
			args["name"] = "%" + v.SearchValue + "%"
		case "email":
			lq.WriteString(` and tmu.email ilike @email`)
			args["email"] = "%" + v.SearchValue + "%"
		case "role_name":
			lq.WriteString(` and tmnur.name ilike @role_name`)
			args["role_name"] = "%" + v.SearchValue + "%"
		case "is_blocked":
			lq.WriteString(` and is_blocked ilike @is_blocked`)
			args["is_blocked"] = "%" + v.SearchValue + "%"
		case "from_date":
			lq.WriteString(` and tmu.created_at >= TO_TIMESTAMP(@from_date)`)
			args["from_date"] = v.SearchValue
		case "to_date":
			lq.WriteString(` and tmu.created_at <= TO_TIMESTAMP(@to_date)`)
			args["to_date"] = v.SearchValue
		}
	}

	lq.WriteString(`
		) 
select 
  ROW_NUMBER() OVER(
    
  ) AS row_num, 
  ul.user_id, 
  ul.name, 
  ul.email, 
  ul.role_id, 
  ul.role_name, 
  ul.created_at_epoch, 
  ul.is_blocked 
from 
  UserList ul
	`)

	cq.WriteString(` select COUNT( *) from (`)
	cq.WriteString(lq.String())
	cq.WriteString(` ) `)

	sortMap := map[string]string{
		"name":       "ul.name",
		"created_at": "ul.created_at",
		"email":      "ul.email",
		"role_name":  "ul.name",
	}
	if len(req.Pagination.SortFilter) > 0 {
		sortString := []string{" ORDER BY "}
		for _, v := range req.Pagination.SortFilter {
			sortOrdr := "asc"
			if v.SortOrder == int32(common.Desc) {
				sortOrdr = "desc"
			}
			if column, exists := sortMap[v.SortColumn]; exists {
				sortString = append(sortString, column+" "+sortOrdr)
			}
		}

		if len(sortString) > 1 {
			for _, v := range sortString {
				lq.WriteString(v)
			}
		}
	}

	lq.WriteString(fmt.Sprintf(` limit %v `, limit))
	lq.WriteString(fmt.Sprintf(` offset %v `, offset))

	return args, lq.String(), cq.String()
}

func (db *DbClient) getUsers(ctx context.Context, query string, args pgx.NamedArgs) ([]*models.UserDetails, error) {
	response := make([]*models.UserDetails, 0)

	rows, err := db.Conn.Query(ctx, query, args)
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}

	type user struct {
		RowNum         int64  `json:"row_num"`
		UserId         int64  `json:"user_id"`
		Name           string `json:"name"`
		Email          string `json:"email"`
		RoleId         int64  `json:"role_id"`
		RoleName       string `json:"role_name"`
		CreatedAtEpoch int64  `json:"created_at_epoch"`
		IsBlocked      bool   `json:"is_blocked"`
	}

	users, err := pgx.CollectRows(rows, pgx.RowToStructByPos[user])
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}

	for _, v := range users {
		response = append(response, &models.UserDetails{
			RowNum:    v.RowNum,
			UserId:    v.UserId,
			Name:      v.Name,
			RoleId:    int32(v.RoleId),
			RoleName:  v.RoleName,
			CreatedAt: int32(v.CreatedAtEpoch),
			IsBlocked: v.IsBlocked,
		})
	}

	return response, nil
}

func (db *DbClient) getUserTotalCount(ctx context.Context, query string, args pgx.NamedArgs) (*int64, error) {

	var totalCount int64
	err := db.Conn.QueryRow(ctx, query, args).Scan(&totalCount)
	if err != nil {
		log.Println(err.Error())
		return nil, err
	}

	return &totalCount, nil
}

func (db *DbClient) DeleteUser(ctx context.Context, userId int64) (*models.DeleteUserResponse, error) {
	response := &models.DeleteUserResponse{}
	query := `delete from tbl_mst_user
		where user_id=@user_id
`
	args := pgx.NamedArgs{
		"user_id": userId,
	}

	resp, err := db.Conn.Exec(ctx, query, args)
	if err != nil {
		log.Println("DeleteUser QUERY failed: " + err.Error())
		return nil, err
	}

	if resp.RowsAffected() == 0 {
		response.Success = false
		response.Message = "operation failed"
		return response, nil
	}
	response.UserId = userId
	response.Success = true
	response.Message = "operation successful"
	return response, nil
}

func (db *DbClient) GetHashedUserPassword(ctx context.Context, email string) (*string, *models.User, error) {

	query := `select hashed_password,user_id,role_id from tbl_mst_user 
		where email=@email
`
	args := pgx.NamedArgs{
		"email": email,
	}
	var (
		hashedPassword string
		userId         int64
		roleId         int32
	)

	err := db.Conn.QueryRow(ctx, query, args).Scan(&hashedPassword, &userId, &roleId)
	if err != nil {
		log.Println("DeleteUser QUERY failed: " + err.Error())
		return nil, nil, err
	}

	return &hashedPassword, &models.User{
		UserId: userId,
		RoleId: roleId,
	}, nil
}

func (db *DbClient) ValidateAccess(ctx context.Context, roleId int32, resAccessId int64) bool {

	query := `select role_access_id from tbl_mst_nui_role_access tmnra 
where tmnra.resource_access_id=@resource_access_id and tmnra.role_id=@role_id
`
	args := pgx.NamedArgs{
		"role_id":            roleId,
		"resource_access_id": resAccessId,
	}
	var (
		access int64
	)

	err := db.Conn.QueryRow(ctx, query, args).Scan(&access)
	if err != nil {
		log.Println("ValidateAccess QUERY failed: " + err.Error())
		return false
	}

	if access == 0 {
		return false
	}
	return true
}

func (db *DbClient) GetRoleAccessMapping(ctx context.Context) (*models.RoleAccessMapping, error) {
	response := &models.RoleAccessMapping{}
	query := ` select 
  role_id, 
  string_agg(resource_access_id :: text, ',') as access
from 
  tbl_mst_nui_role_access 
group by 
  role_id 
order by 
  role_id
`

	rows, err := db.Conn.Query(ctx, query)
	if err != nil {
		log.Println("GetRoleAccessMapping QUERY failed: " + err.Error())
		return nil, err
	}

	mappings, err := pgx.CollectRows(rows, pgx.RowToAddrOfStructByPos[models.RoleAccess])
	if err != nil {
		log.Println("GetRoleAccessMapping CollectRows failed: " + err.Error())
		return nil, err
	}

	response.RoleAccess = mappings
	return response, nil
}
