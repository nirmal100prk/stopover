package jwtutil

import (
	"fmt"
	"log/slog"
	"stopover.backend/config"
	"stopover.backend/internal/models"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

type TokenRepo interface {
	CreateAccessToken(userId int64, roleId int32) (string, error)
	CreateRefreshToken(userId int64, roleId int32) (string, error)
	ValidateAccessToken(token string) (*models.User, error)
	ValidateRefreshToken(token string) (*models.User, error)
	RefreshAccessToken(token string) (string, error)
}

func NewTokenService(cfg config.Config) TokenRepo {
	return &tokenSvc{
		cfg: cfg,
	}
}

type tokenSvc struct {
	cfg config.Config
}

type UserClaims struct {
	Id     int64 `json:"id"`
	RoleId int32 `json:"role_id"`
	jwt.RegisteredClaims
}

func (c *tokenSvc) CreateAccessToken(userId int64, roleId int32) (string, error) {

	claims := UserClaims{
		Id:     userId,
		RoleId: roleId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(30 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	accessToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return accessToken.SignedString([]byte(c.cfg.SecretKey))
}

func (c *tokenSvc) CreateRefreshToken(userId int64, roleId int32) (string, error) {
	claims := UserClaims{
		Id:     userId,
		RoleId: roleId,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(24 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
		},
	}
	refreshToken := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)

	return refreshToken.SignedString([]byte(c.cfg.SecretKey))
}

func (c *tokenSvc) ValidateAccessToken(token string) (*models.User, error) {
	return c.validateToken(token)
}

func (c *tokenSvc) ValidateRefreshToken(token string) (*models.User, error) {
	return c.validateToken(token)
}

func (c *tokenSvc) validateToken(token string) (*models.User, error) {

	parsedToken, _ := jwt.ParseWithClaims(token, &UserClaims{}, func(token *jwt.Token) (interface{}, error) {
		return []byte(c.cfg.SecretKey), nil
	})

	// Check if the token is valid
	if !parsedToken.Valid {
		slog.Error("invalid token")
		return nil, fmt.Errorf("invalid token")
	}

	claims, ok := parsedToken.Claims.(*UserClaims)
	if !ok {
		slog.Error("invalid token, parse claims failed")
		return nil, fmt.Errorf("invalid token")
	}

	// Return the verified token
	return &models.User{
		UserId: claims.Id,
		RoleId: claims.RoleId,
	}, nil

}

func (c *tokenSvc) RefreshAccessToken(token string) (string, error) {

	userInfo, err := c.ValidateRefreshToken(token)
	if err != nil {
		slog.Error(err.Error())
	}
	return c.CreateAccessToken(userInfo.UserId, userInfo.RoleId)
}
