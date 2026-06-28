package domain

import "errors"

var (
	ErrNotFound          = errors.New("entity not found")
	ErrAlreadyExists     = errors.New("entity already exists")
	ErrUnauthorized      = errors.New("unauthorized")
	ErrForbidden         = errors.New("forbidden")
	ErrInvalidInput      = errors.New("invalid input")
	ErrInsufficientFunds = errors.New("insufficient funds")
	ErrBudgetExceeded    = errors.New("budget limit exceeded")
	ErrAccountArchived   = errors.New("account is archived")
)
