package repository

import (
	"context"
	"stopover.backend/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type DBRepository interface {
	UserRepository
}

type DbClient struct {
	Conn *pgxpool.Pool
}

func NewRepository(conn *pgxpool.Pool) DBRepository {
	return &DbClient{
		Conn: conn,
	}
}

func NewUserRepository(conn *pgxpool.Pool) UserRepository {
	return &DbClient{
		Conn: conn,
	}
}

type UserRepository interface {
	CreateUser(ctx context.Context, req models.CreateUser) (*models.CreateUserResponse, error)
	ListUser(ctx context.Context, req models.ListUserRequest) (*models.ListUserResponse, error)
	DeleteUser(ctx context.Context, userId int64) (*models.DeleteUserResponse, error)

	GetHashedUserPassword(ctx context.Context, email string) (*string, *models.User, error)
	ValidateAccess(ctx context.Context, roleId int32, resAccessId int64) bool
	GetRoleAccessMapping(ctx context.Context) (*models.RoleAccessMapping, error)
}
