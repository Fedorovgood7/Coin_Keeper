package entity

import "time"

type MonthlyBudget struct {
	ID              string
	UserID          string
	Month           string
	PlannedAmount   float64
	ActualAmount    float64
	SafeDailyAmount float64
	CreatedAt       time.Time
	UpdatedAt       time.Time
}

func (b *MonthlyBudget) UpdateActual(amount float64) {
	b.ActualAmount = amount
	b.UpdatedAt = time.Now()
}

func (b *MonthlyBudget) CalculateUsagePercent() float64 {
	if b.PlannedAmount == 0 {
		return 0
	}
	return (b.ActualAmount / b.PlannedAmount) * 100
}

func (b *MonthlyBudget) RemainingAmount() float64 {
	return b.PlannedAmount - b.ActualAmount
}

type CategoryLimit struct {
	ID         string
	UserID     string
	CategoryID string
	Month      string
	Limit      float64
	Spent      float64
	CreatedAt  time.Time
	UpdatedAt  time.Time
}

func (cl *CategoryLimit) AddSpent(amount float64) {
	cl.Spent += amount
	cl.UpdatedAt = time.Now()
}

func (cl *CategoryLimit) IsExceeded() bool {
	return cl.Spent > cl.Limit
}

func (cl *CategoryLimit) Remaining() float64 {
	return cl.Limit - cl.Spent
}

func (cl *CategoryLimit) UsagePercent() float64 {
	if cl.Limit == 0 {
		return 0
	}
	return (cl.Spent / cl.Limit) * 100
}
