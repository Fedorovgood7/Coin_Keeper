package repository

import (
	"context"
	"coinkeeper/internal/domain/entity"
	"time"
)

type TransactionFilter struct {
	UserID     string
	DateFrom   *time.Time
	DateTo     *time.Time
	AccountID  string
	CategoryID string
	Type       entity.TransactionType
}

type TransactionRepository interface {
	Create(ctx context.Context, transaction *entity.Transaction) error
	GetByID(ctx context.Context, id string, userID string) (*entity.Transaction, error)
	GetByFilter(ctx context.Context, filter TransactionFilter) ([]*entity.Transaction, error)
	Update(ctx context.Context, transaction *entity.Transaction) error
	Delete(ctx context.Context, id string, userID string) error
	GetTotalByCategory(ctx context.Context, userID string, month string) (map[string]float64, error)
	GetDailyTotals(ctx context.Context, userID string, month string) (map[string]float64, error)
	GetIncomeTotal(ctx context.Context, userID string, month string) (float64, error)
	GetExpenseTotal(ctx context.Context, userID string, month string) (float64, error)
}
