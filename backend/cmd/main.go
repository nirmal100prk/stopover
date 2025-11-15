package main

import (
	"stopover.backend/config"
	"stopover.backend/internal/api"
)

func main() {
	config.LoadConfig()
	api.StartServer()
}
