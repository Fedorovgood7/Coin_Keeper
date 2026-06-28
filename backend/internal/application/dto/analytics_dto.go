package dto

type CategoryStatsRequest struct {
	Month string `form:"month" validate:"required,month"`
}

type CategoryStatsResponse struct {
	Month      string             `json:"month"`
	Categories []CategoryStatItem `json:"categories"`
	Total      float64            `json:"total"`
}

type DailyStatsRequest struct {
	Month string `form:"month" validate:"required,month"`
}

type DailyStatsResponse struct {
	Month string          `json:"month"`
	Days  []DailyStatItem `json:"days"`
}

type DailyStatItem struct {
	Date   string  `json:"date"`
	Amount float64 `json:"amount"`
}

type IncomeExpenseComparisonRequest struct {
	Month string `form:"month" validate:"required,month"`
}

type IncomeExpenseComparisonResponse struct {
	Month   string  `json:"month"`
	Income  float64 `json:"income"`
	Expense float64 `json:"expense"`
	Saving  float64 `json:"saving"`
}
