package dto

import "time"

type CreateAccountRequest struct {
	Name           string  `json:"name" validate:"required,min=1,max=100"`
	Type           string  `json:"type" validate:"required,oneof=cash card deposit"`
	Currency       string  `json:"currency" validate:"required,oneof=RUB USD EUR"`
	InitialBalance float64 `json:"initial_balance" validate:"gte=0"`
}

type UpdateAccountRequest struct {
	ID   string  `json:"id" validate:"required"`
	Name *string `json:"name,omitempty" validate:"omitempty,min=1,max=100"`
}

type AccountResponse struct {
	ID             string    `json:"id"`
	Name           string    `json:"name"`
	Type           string    `json:"type"`
	Currency       string    `json:"currency"`
	Balance        float64   `json:"balance"`
	InitialBalance float64   `json:"initial_balance"`
	IsArchived     bool      `json:"is_archived"`
	CreatedAt      time.Time `json:"created_at"`
}
