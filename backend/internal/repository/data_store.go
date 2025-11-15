package repository

import (
	"context"
	"errors"
	"fmt"
	"log"
	"time"

	"stopover.backend/config"

	"github.com/jackc/pgx/v5/pgxpool"
)

func NewPostgres(ctx context.Context, cfg config.Config) (*pgxpool.Pool, error) {
	dbConfig, err := Config(cfg)
	if err != nil {
		return nil, fmt.Errorf("failed to parse DB config: %w", err)
	}

	connPool, err := pgxpool.NewWithConfig(ctx, dbConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to create DB pool: %w", err)
	}

	// Ping the database with timeout to validate connectivity
	pingCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	if err := connPool.Ping(pingCtx); err != nil {
		connPool.Close()
		return nil, fmt.Errorf("failed to ping database: %w", err)
	}

	log.Println("✅ Connected to PostgreSQL database")
	return connPool, nil
}

func Config(cfg config.Config) (*pgxpool.Config, error) {
	if cfg.DBUser == "" || cfg.DBPassword == "" || cfg.DBHost == "" || cfg.DBPort == "" || cfg.DBName == "" {
		return nil, errors.New("incomplete database configuration")
	}

	dbURL := fmt.Sprintf("postgresql://%s:%s@%s:%s/%s",
		cfg.DBUser, cfg.DBPassword, cfg.DBHost, cfg.DBPort, cfg.DBName)

	dbConfig, err := pgxpool.ParseConfig(dbURL)
	if err != nil {
		return nil, fmt.Errorf("unable to parse db URL: %w", err)
	}

	// Tune connection pool - can be moved to config.Config if needed
	dbConfig.MaxConns = 10
	dbConfig.MinConns = 2
	dbConfig.MaxConnLifetime = time.Hour
	dbConfig.MaxConnIdleTime = 30 * time.Minute
	dbConfig.HealthCheckPeriod = time.Minute
	dbConfig.ConnConfig.ConnectTimeout = 5 * time.Second

	return dbConfig, nil
}
