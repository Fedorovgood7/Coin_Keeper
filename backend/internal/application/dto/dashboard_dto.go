package dto

type DashboardResponse struct {
	TotalBalance      float64             `json:"total_balance"`
	MonthlyIncome     float64             `json:"monthly_income"`
	MonthlyExpense    float64             `json:"monthly_expense"`
	BudgetRemaining   float64             `json:"budget_remaining"`
	SafeDailyAmount   float64             `json:"safe_daily_amount"`
	TopCategories     []CategoryStatItem  `json:"top_categories"`
	UpcomingRecurring []RecurringResponse `json:"upcoming_recurring"`
}

type CategoryStatItem struct {
	CategoryID string  `json:"category_id"`
	Name       string  `json:"name"`
	Amount     float64 `json:"amount"`
	Percent    float64 `json:"percent"`
}
