package dto

import "time"

type CreateRecurringRequest struct {
	Type        string    `json:"type" validate:"required,oneof=income expense transfer"`
	Amount      float64   `json:"amount" validate:"required,gt=0"`
	AccountID   string    `json:"account_id" validate:"required"`
	ToAccountID string    `json:"to_account_id,omitempty"`
	CategoryID  string    `json:"category_id" validate:"required"`
	Periodicity string    `json:"periodicity" validate:"required,oneof=daily weekly monthly"`
	NextDate    time.Time `json:"next_date" validate:"required"`
	Comment     string    `json:"comment,omitempty"`
}

type RecurringResponse struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Amount      float64   `json:"amount"`
	AccountID   string    `json:"account_id"`
	ToAccountID string    `json:"to_account_id,omitempty"`
	CategoryID  string    `json:"category_id"`
	Periodicity string    `json:"periodicity"`
	NextDate    time.Time `json:"next_date"`
	Comment     string    `json:"comment"`
	IsActive    bool      `json:"is_active"`
	CreatedAt   time.Time `json:"created_at"`
}
