package config

import (
	"fmt"
	"log"
	"reflect"
	"strconv"
	"strings"

	"github.com/spf13/viper"
)

type Config struct {
	DBHost             string          `mapstructure:"DB_HOST"`
	DBPort             string          `mapstructure:"DB_PORT"`
	DBUser             string          `mapstructure:"DB_USER"`
	DBPassword         string          `mapstructure:"DB_PASSWORD"`
	DBName             string          `mapstructure:"DB_NAME"`
	Port               string          `mapstructure:"PORT"`
	SecretKey          string          `mapstructure:"SECRET_KEY"`
	RedisRoleAccessKey string          `mapstructure:"ROLE_ACCESS_KEY"`
	RedisHostPort      string          `mapstructure:"REDIS_HOST_PORT"`
	AviaSalesConfig    AviaSalesConfig `mapstructure:",squash"`
}

type AviaSalesConfig struct {
	InitSearchURL   string `mapstructure:"INIT_SEARCH_URL"`
	ResultSearchURL string `mapstructure:"RESULT_SEARCH_URL"`
	AviaSalesToken  string `mapstructure:"AVIASALES_TOKEN"`
	AviaSalesMarker string `mapstructure:"AVIASALES_MARKER"`
	AviaSalesHost   string `mapstructure:"AVIASALES_HOST"`
}

var AppConfig Config

func LoadConfig() {

	viper.SetConfigFile("C:/Users/npnirmal/Workspace/Codebase/Projects/github.com/Final/stopover/backend\.env")
	viper.AutomaticEnv()

	err := viper.ReadInConfig()
	if err != nil {
		log.Printf("Error reading config file: %s", err)
		log.Println("Using environment variables only")
	}

	// Handle PORT separately
	portValue := viper.GetString("PORT")
	if strings.Contains(portValue, ":") {
		parts := strings.Split(portValue, ":")
		if len(parts) == 2 {
			viper.Set("HOST", parts[0])
			portValue = parts[1]
		}
	}
	port, err := strconv.Atoi(portValue)
	if err != nil {
		log.Printf("Invalid PORT value: %s. Using default 8080", portValue)
		port = 8080
	}
	viper.Set("PORT", port)

	// Unmarshal config
	err = viper.Unmarshal(&AppConfig)
	if err != nil {
		panic(fmt.Errorf("fatal error when unmarshaling config: %s", err))
	}

	// Override config with environment variables
	t := reflect.TypeOf(AppConfig)
	for i := 0; i < t.NumField(); i++ {
		field := t.Field(i)
		envKey := field.Tag.Get("mapstructure")
		if envKey != "" && envKey != "PORT" { // Skip PORT as we've already handled it
			envVal := viper.GetString(envKey)
			if envVal != "" {
				viper.Set(envKey, envVal)
			}
		}
	}

	// Re-unmarshal to ensure all values are updated
	err = viper.Unmarshal(&AppConfig)
	if err != nil {
		panic(fmt.Errorf("fatal error when re-unmarshaling config: %s", err))
	}
}
