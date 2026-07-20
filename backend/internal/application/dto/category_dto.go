package dto

import "time"

type CreateCategoryRequest struct {
	Name  string `json:"name" validate:"required,min=1,max=100"`
	Type  string `json:"type" validate:"required,oneof=income expense"`
	Color string `json:"color" validate:"omitempty,hexcolor"`
	Icon  string `json:"icon" validate:"omitempty"`
}

type UpdateCategoryRequest struct {
	ID    string  `json:"id" validate:"required"`
	Color *string `json:"color,omitempty" validate:"omitempty,hexcolor"`
	Icon  *string `json:"icon,omitempty"`
}

type CategoryResponse struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Type      string    `json:"type"`
	Color     string    `json:"color"`
	Icon      string    `json:"icon"`
	IsDefault bool      `json:"is_default"`
	CreatedAt time.Time `json:"created_at"`
}
