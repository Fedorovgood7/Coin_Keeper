package dto

import "time"

type SetMonthlyBudgetRequest struct {
	Month         string  `json:"month" validate:"required,month"`
	PlannedAmount float64 `json:"planned_amount" validate:"required,gt=0"`
}

type SetCategoryLimitRequest struct {
	CategoryID string  `json:"category_id" validate:"required"`
	Month      string  `json:"month" validate:"required,month"`
	Limit      float64 `json:"limit" validate:"required,gt=0"`
}

type MonthlyBudgetResponse struct {
	ID              string    `json:"id"`
	Month           string    `json:"month"`
	PlannedAmount   float64   `json:"planned_amount"`
	ActualAmount    float64   `json:"actual_amount"`
	UsagePercent    float64   `json:"usage_percent"`
	RemainingAmount float64   `json:"remaining_amount"`
	SafeDailyAmount float64   `json:"safe_daily_amount"`
	UpdatedAt       time.Time `json:"updated_at"`
}

type CategoryLimitResponse struct {
	ID           string    `json:"id"`
	CategoryID   string    `json:"category_id"`
	Month        string    `json:"month"`
	Limit        float64   `json:"limit"`
	Spent        float64   `json:"spent"`
	Remaining    float64   `json:"remaining"`
	UsagePercent float64   `json:"usage_percent"`
	IsExceeded   bool      `json:"is_exceeded"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type SafeDailyAmountResponse struct {
	Month         string  `json:"month"`
	SafeDailyAmount float64 `json:"safe_daily_amount"`
	RemainingDays int     `json:"remaining_days"`
}
