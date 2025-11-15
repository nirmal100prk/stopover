package common

import (
	"context"
	"stopover.backend/internal/models"

	"github.com/gin-gonic/gin"
)

type contextKey string

func (c contextKey) String() string {
	return string(c)
}

var (
	ContextKeyUser   = contextKey("user")
	ContextKeyUserId = contextKey("user-id")
	ContextKeyRole   = contextKey("role-id")
)

type Values struct {
	m map[string]int64
}

func (v Values) Get(key string) int64 {
	return v.m[key]
}

func SetUser(c *gin.Context, userInfo *models.User) {

	ctx := c.Request.Context()
	values := Values{
		m: map[string]int64{
			ContextKeyUserId.String(): userInfo.UserId,
			ContextKeyRole.String():   int64(userInfo.RoleId),
		},
	}
	newCtx := context.WithValue(ctx, ContextKeyUser.String(), values)

	c.Request = c.Request.WithContext(newCtx)

}

func GetUserFromContext(ctx context.Context) *models.User {
	values, ok := ctx.Value(ContextKeyUser.String()).(Values)
	if !ok {
		return nil
	}

	userId, ok := values.m[ContextKeyUserId.String()]
	if !ok {
		return nil
	}

	roleId, ok := values.m[ContextKeyRole.String()]
	if !ok {
		return nil
	}

	return &models.User{
		UserId: userId,
		RoleId: int32(roleId),
	}
}
