package handler

import (
	"log"
	"net/http"
	"strconv"

	"stopover.backend/internal/models"
	"stopover.backend/internal/services"
	"stopover.backend/pkg/common"

	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	services services.Services
}

func NewUserHandler(services services.Services) *UserHandler {
	return &UserHandler{
		services: services,
	}
}

func (h *UserHandler) CreateUser(c *gin.Context) {

	log.Println("CreateUser - started")
	ctx := c.Request.Context()
	var user models.CreateUserRequest
	var response models.CreateUserResponse

	err := common.ValidateRequest(c, &user)
	if err != nil {
		response.Message = err.Error()
		c.JSON(http.StatusBadRequest, response)
		return
	}

	resp, err := h.services.CreateUser(ctx, user)
	if err != nil {
		response.Message = err.Error()
		c.JSON(http.StatusBadRequest, response)
		return
	}

	if resp.UserId != 0 {
		resp.Message = "User created successfully"
	}
	c.JSON(http.StatusOK, resp)
	log.Println("CreateUser - completed successfully")
}

func (h *UserHandler) GetAllUsers(c *gin.Context) {
	response := models.ListUserResponse{
		Users: make([]*models.UserDetails, 0),
	}

	log.Println("GetAllUsers - started")
	ctx := c.Request.Context()
	var req models.ListUserRequest

	err := common.ValidateRequest(c, &req)
	if err != nil {
		c.JSON(http.StatusBadRequest, response)
		return
	}

	resp, err := h.services.ListUser(ctx, req)
	if err != nil || len(resp.Users) == 0 {
		c.JSON(http.StatusOK, response)
		return
	}

	c.JSON(http.StatusOK, resp)
	log.Println("GetAllUsers - completed successfully")
}

func (h *UserHandler) DeleteUser(c *gin.Context) {

	log.Println("DeleteUser - started")
	ctx := c.Request.Context()
	var response models.DeleteUserResponse

	id := c.Param("id")

	if id == "" {
		response.Message = "user id required"
		c.JSON(http.StatusBadRequest, response)
		return
	}

	val, err := strconv.Atoi(id)
	if err != nil {
		response.Message = "invalid user id"
		c.JSON(http.StatusBadRequest, response)
		return
	}
	resp, err := h.services.DeleteUser(ctx, int64(val))
	if err != nil {
		response.Message = err.Error()
		c.JSON(http.StatusBadRequest, response)
		return
	}

	if resp.UserId != 0 {
		resp.Message = "User deleted successfully"
	}
	c.JSON(http.StatusOK, resp)
	log.Println("DeleteUser - completed successfully")
}

func (h *UserHandler) Login(c *gin.Context) {

	log.Println("Login - started")
	ctx := c.Request.Context()
	var req models.LoginRequest
	var response models.LoginResponse

	err := common.ValidateRequest(c, &req)
	if err != nil {
		response.Message = err.Error()
		c.JSON(http.StatusBadRequest, response)
		return
	}

	resp, err := h.services.Login(ctx, req)
	if err != nil {
		response.Message = err.Error()
		c.JSON(http.StatusBadRequest, response)
		return
	}

	c.JSON(http.StatusOK, resp)
	log.Println("Login - completed successfully")
}
