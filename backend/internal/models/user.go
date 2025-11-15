package models

// create user api request
type CreateUserRequest struct {
	Name     string `json:"name" validate:"required,min=4,max=20"`
	EmailId  string `json:"email_id" validate:"required,email"`
	Password string `json:"password" validate:"required,min=5,max=20"`
	RoleId   int32  `json:"role_id" validate:"required,gt=0,oneof=1 2 3"`
}

// create user api response
type CreateUserResponse struct {
	Message string `json:"message"`
	UserId  int64  `json:"user_id"`
	Success bool   `json:"success"`
}

type CreateUser struct {
	Name           string
	EmailId        string
	HashedPassword string
	RoleId         int32
}

// User defines the structure of the user model
type User struct {
	UserId    int64  `json:"user_id"`
	Name      string `json:"name"`
	EmailId   string `json:"email_id"`
	RoleId    int32  `json:"role_id"`
	RoleName  string `json:"role_name"`
	CreatedAt int32  `json:"created_at"`
}

// list user api request
type ListUserRequest struct {
	Pagination Pagination `json:"pagination"`
}

// list user api response
type ListUserResponse struct {
	Users      []*UserDetails `json:"user"`
	TotalCount int64          `json:"total_count"`
}

// common pagination object with searching and sorting
type Pagination struct {
	PageNumber   int32          `json:"page_number"`
	PageSize     int32          `json:"page_size"`
	SearchFilter []SearchFilter `json:"search_filter"`
	SortFilter   []SortFilter   `json:"sort_Filter"`
}

// search filter: provide column name in search_column and the value to be searched in search_value field
type SearchFilter struct {
	SearchColumn string `json:"search_column"`
	SearchValue  string `json:"search_value"`
}

// sort filter:  provide column name in sort_column and the value to be sorted in sort_order field
type SortFilter struct {
	SortColumn string `json:"sort_column"`
	SortOrder  int32  `json:"sort_order"`
}

type UserDetails struct {
	RowNum    int64  `json:"row_num"`
	UserId    int64  `json:"user_id"`
	Name      string `json:"name"`
	EmailId   string `json:"email_id"`
	RoleId    int32  `json:"role_id"`
	RoleName  string `json:"role_name"`
	CreatedAt int32  `json:"created_at"`
	IsBlocked bool   `json:"is_blocked"`
}

// delete user api response
type DeleteUserResponse struct {
	Message string `json:"message"`
	UserId  int64  `json:"user_id"`
	Success bool   `json:"success"`
}

// login api request
type LoginRequest struct {
	EmailId  string `json:"email_id" validate:"required,email"`
	Password string `json:"password" validate:"required,min=5,max=20"`
}

// login api response
type LoginResponse struct {
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	Message      string `json:"message"`
	Success      bool   `json:"bool"`
}

type RoleAccessMapping struct {
	RoleAccess []*RoleAccess
}

type RoleAccess struct {
	RoleId int32
	Access string
}
