package common

type UserRole int32
type SortDirection int32
type PropertyStatus int32

const (
	Admin  UserRole = 1
	Buyer  UserRole = 2
	Seller UserRole = 3
)

const (
	Asc  SortDirection = 0
	Desc SortDirection = 1
)

const (
	Available PropertyStatus = 1
	Sold      PropertyStatus = 2
)
