package services

import (
	"context"
	"stopover.backend/internal/models"
	"stopover.backend/internal/repository"
	"stopover.backend/pkg/jwtutil"
)

type Service struct {
	Repo      repository.DBRepository
	TokenRepo jwtutil.TokenRepo
}

type Services interface {
	UserServices
}

func NewService(repo repository.DBRepository, tksvc jwtutil.TokenRepo) Services {
	return &Service{
		Repo:      repo,
		TokenRepo: tksvc,
	}
}

type UserServices interface {
	CreateUser(ctx context.Context, req models.CreateUserRequest) (*models.CreateUserResponse, error)
	ListUser(ctx context.Context, req models.ListUserRequest) (*models.ListUserResponse, error)
	DeleteUser(ctx context.Context, userId int64) (*models.DeleteUserResponse, error)

	Login(ctx context.Context, req models.LoginRequest) (*models.LoginResponse, error)
}
