package common

type PgErrorCode string

const (
	UniqueConstraint PgErrorCode = "23505"
)
