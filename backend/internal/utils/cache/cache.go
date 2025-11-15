package cache

import (
	"context"
	"log"
	"stopover.backend/config"

	"github.com/redis/go-redis/v9"
)

type CacheService interface {
	SetValue(ctx context.Context, field, value string) error
	GetValue(ctx context.Context, field string) (string, error)
	DeleteValue(ctx context.Context, field string) error
	KeyExists(ctx context.Context, field string) (bool, error)
	GetAllValues(ctx context.Context) (map[string]string, error)
	FlushAll(ctx context.Context) error
}

type redisClient struct {
	rdb *redis.Client
	cfg config.Config
}

func NewCacheService(rdb *redis.Client, cfg config.Config) CacheService {
	return &redisClient{
		rdb: rdb,
		cfg: cfg,
	}
}

func NewRedisClient(ctx context.Context, cfg config.Config) (*redis.Client, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     cfg.RedisHostPort,
		Password: "",
		DB:       0,
	})

	if pong, err := rdb.Ping(ctx).Result(); err != nil {
		log.Println("Redis connection failed:", err)
		return nil, err
	} else {
		log.Println("Redis connected:", pong)
	}

	return rdb, nil
}

// SetValue sets a value under the configured Redis hash
func (r *redisClient) SetValue(ctx context.Context, field, value string) error {
	return r.rdb.HSet(ctx, r.cfg.RedisRoleAccessKey, field, value).Err()
}

// GetValue gets a value by field from the configured Redis hash
func (r *redisClient) GetValue(ctx context.Context, field string) (string, error) {
	return r.rdb.HGet(ctx, r.cfg.RedisRoleAccessKey, field).Result()
}

// DeleteValue deletes a field from the Redis hash
func (r *redisClient) DeleteValue(ctx context.Context, field string) error {
	return r.rdb.HDel(ctx, r.cfg.RedisRoleAccessKey, field).Err()
}

// KeyExists checks if a field exists in the Redis hash
func (r *redisClient) KeyExists(ctx context.Context, field string) (bool, error) {
	exists, err := r.rdb.HExists(ctx, r.cfg.RedisRoleAccessKey, field).Result()
	return exists, err
}

// GetAllValues fetches all key-value pairs from the Redis hash
func (r *redisClient) GetAllValues(ctx context.Context) (map[string]string, error) {
	return r.rdb.HGetAll(ctx, r.cfg.RedisRoleAccessKey).Result()
}

// FlushAll clears the entire Redis DB (use cautiously)
func (r *redisClient) FlushAll(ctx context.Context) error {
	return r.rdb.FlushAll(ctx).Err()
}
