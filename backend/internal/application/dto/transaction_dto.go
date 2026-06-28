package dto

import "time"

type CreateTransactionRequest struct {
	Type        string    `json:"type" validate:"required,oneof=income expense transfer"`
	Amount      float64   `json:"amount" validate:"required,gt=0"`
	AccountID   string    `json:"account_id" validate:"required"`
	ToAccountID string    `json:"to_account_id,omitempty"`
	CategoryID  string    `json:"category_id" validate:"required"`
	Date        time.Time `json:"date" validate:"required"`
	Comment     string    `json:"comment,omitempty"`
}

type UpdateTransactionRequest struct {
	ID         string     `json:"id" validate:"required"`
	Amount     *float64   `json:"amount,omitempty" validate:"omitempty,gt=0"`
	CategoryID *string    `json:"category_id,omitempty"`
	Date       *time.Time `json:"date,omitempty"`
	Comment    *string    `json:"comment,omitempty"`
}

type TransactionFilterRequest struct {
	DateFrom   *time.Time `form:"date_from"`
	DateTo     *time.Time `form:"date_to"`
	AccountID  string     `form:"account_id"`
	CategoryID string     `form:"category_id"`
	Type       string     `form:"type"`
}

type TransactionResponse struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Amount      float64   `json:"amount"`
	AccountID   string    `json:"account_id"`
	ToAccountID string    `json:"to_account_id,omitempty"`
	CategoryID  string    `json:"category_id"`
	Date        time.Time `json:"date"`
	Comment     string    `json:"comment"`
	CreatedAt   time.Time `json:"created_at"`
}
