package services

import (
	"context"
	"stopover.backend/internal/models"
	"stopover.backend/pkg/common"
)

func (s *Service) CreateUser(ctx context.Context, req models.CreateUserRequest) (*models.CreateUserResponse, error) {

	hashedPassword, err := common.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	return s.Repo.CreateUser(ctx, models.CreateUser{
		Name:           req.Name,
		EmailId:        req.EmailId,
		HashedPassword: hashedPassword,
		RoleId:         req.RoleId,
	})
}

func (s *Service) ListUser(ctx context.Context, req models.ListUserRequest) (*models.ListUserResponse, error) {
	return s.Repo.ListUser(ctx, req)
}

func (s *Service) DeleteUser(ctx context.Context, userId int64) (*models.DeleteUserResponse, error) {
	return s.Repo.DeleteUser(ctx, userId)
}

func (s *Service) Login(ctx context.Context, req models.LoginRequest) (*models.LoginResponse, error) {
	response := &models.LoginResponse{}

	hashedPass, user, err := s.Repo.GetHashedUserPassword(ctx, req.EmailId)
	if err != nil {
		response.Message = "invalid credentials"
		return response, nil
	}

	valid := common.VerifyPassword(req.Password, *hashedPass)
	if !valid {
		response.Message = "wrong password"
		return response, nil
	}

	accessTok, err := s.TokenRepo.CreateAccessToken(user.UserId, user.RoleId)
	if err != nil {
		return nil, err
	}

	refTok, err := s.TokenRepo.CreateRefreshToken(user.UserId, user.RoleId)
	if err != nil {
		return nil, err
	}

	response.AccessToken = accessTok
	response.RefreshToken = refTok
	response.Success = true
	response.Message = "logged in successfully"
	return response, nil

}
