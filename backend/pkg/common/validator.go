package common

import (
	"errors"
	"fmt"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
)

func ValidateRequest(ctx *gin.Context, req interface{}) error {

	if err := ctx.ShouldBindJSON(req); err != nil {

		return errors.New("Invalid input")
	}
	validate := validator.New()

	// Validate the User struct
	err := validate.Struct(req)
	if err != nil {
		errs := err.(validator.ValidationErrors)
		return errors.New(fmt.Sprintf("Validation error: %s", errs))
	}
	return nil
}
