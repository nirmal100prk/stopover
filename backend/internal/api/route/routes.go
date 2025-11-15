package route

import (
	"stopover.backend/config"
	"stopover.backend/internal/api/handler"

	"github.com/gin-gonic/gin"
)

// func SetupRouter(handler *handler.Handler, cfg config.Config, authMiddleware gin.HandlerFunc) *gin.Engine {
func SetupRouter(fhandler *handler.FlightHandler, cfg *config.Config) *gin.Engine {
	router := gin.Default()

	// Minimal CORS for frontend dev
	router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Origin, Content-Type, Accept, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// API group
	api := router.Group("/api")
	{
		api.GET("/airports/autocomplete", fhandler.AirportsAutocomplete)
		api.GET("/flights", fhandler.SearchFlightsAPI)
	}

	// legacy flight group (kept as-is)
	flt := router.Group("/flight")
	flt.POST("/search", fhandler.SearchFlight)
	return router
}
