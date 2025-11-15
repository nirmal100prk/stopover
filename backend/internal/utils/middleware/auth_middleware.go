package middleware

import (
	"net/http"
	"stopover.backend/internal/models"
	"stopover.backend/internal/repository"
	"stopover.backend/pkg/common"
	"stopover.backend/pkg/jwtutil"
	"strings"

	"github.com/gin-gonic/gin"
)

type AuthRepo interface {
	AuthUser(s jwtutil.TokenRepo) gin.HandlerFunc
	OptionalAuthUser(s jwtutil.TokenRepo) gin.HandlerFunc
}

type auth struct {
	userRepo repository.UserRepository
}

func NewAuthRepo(userRepo repository.UserRepository) AuthRepo {
	return &auth{
		userRepo: userRepo,
	}
}

func (au *auth) AuthUser(tokenRepo jwtutil.TokenRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		user, err := parseAndValidateToken(c, tokenRepo)
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
			c.Abort()
			return
		}
		common.SetUser(c, user)
		c.Next()
	}
}

func (au *auth) OptionalAuthUser(tokenRepo jwtutil.TokenRepo) gin.HandlerFunc {
	return func(c *gin.Context) {
		user, err := parseAndValidateToken(c, tokenRepo)
		if err == nil {
			common.SetUser(c, user)
		}
		c.Next()
	}
}

// Helpers

func parseAndValidateToken(c *gin.Context, tokenRepo jwtutil.TokenRepo) (*models.User, error) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		return nil, http.ErrNoCookie
	}
	token := strings.TrimPrefix(authHeader, "Bearer ")

	userInfo, err := tokenRepo.ValidateAccessToken(token)
	if err != nil {
		return nil, err
	}

	return &models.User{
		UserId:   userInfo.UserId,
		RoleId:   userInfo.RoleId,
		RoleName: userInfo.RoleName,
	}, nil
}
