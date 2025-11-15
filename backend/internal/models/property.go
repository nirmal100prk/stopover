package models

// property defines the structure of property model
type Property struct {
	Description       string
	ListingCategoryId int32
	PropertyTypeId    int32
	AddressId         int32
	OwnerId           int64
	Price             int32
	Size              int32
}

// create property api request
type CreatePropertyRequest struct {
	Description    string `json:"description" validate:"required"`
	PropertyTypeId int32  `json:"property_type_id" validate:"required,gt=0"`
	OwnerId        int64  `json:"owner_id" validate:"required,gt=0"`
	Price          int32  `json:"price" validate:"required,gt=0"`
	Size           int32  `json:"size" validate:"required,gt=0"`
	CityId         int32  `json:"city_id" validate:"required,gt=0"`
	HouseNumber    string `json:"house_number" validate:"required"`
	StreetName     string `json:"street_name" validate:"required"`
	PostalCode     int32  `json:"postal_code" validate:"required,gt=0"`
}

// create property api response
type CreatePropertyResponse struct {
	Message    string `json:"message"`
	PropertyId int64  `json:"property_id"`
	Success    bool   `json:"success"`
}

type Address struct {
	AddressId   int32
	CityId      int32
	HouseNumber string
	StreetName  string
	PostalCode  int32
}

// update property api request
type UpdatePropertyRequest struct {
	PropertyId     int64  `json:"property_id" validate:"required,gt=0"`
	Description    string `json:"description" validate:"required"`
	PropertyTypeId int32  `json:"property_type_id" validate:"required,gt=0"`
	OwnerId        int64  `json:"owner_id" validate:"required,gt=0"`
	Price          int32  `json:"price" validate:"required,gt=0"`
	Size           int32  `json:"size" validate:"required,gt=0"`
	CityId         int32  `json:"city_id" validate:"required,gt=0"`
	AddressId      int32  `json:"address_id" validate:"required,gt=0"`
	HouseNumber    string `json:"house_number" validate:"required"`
	StreetName     string `json:"street_name" validate:"required"`
	PostalCode     int32  `json:"postal_code" validate:"required,gt=0"`
}

type UpdatePropertyResponse struct {
	Message string `json:"message"`
	Success bool   `json:"success"`
}
