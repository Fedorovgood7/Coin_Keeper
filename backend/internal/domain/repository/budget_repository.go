package repository

import (
	"context"
	"coinkeeper/internal/domain/entity"
)

type BudgetRepository interface {
	Create(ctx context.Context, budget *entity.MonthlyBudget) error
	GetByMonth(ctx context.Context, userID string, month string) (*entity.MonthlyBudget, error)
	Update(ctx context.Context, budget *entity.MonthlyBudget) error

	CreateCategoryLimit(ctx context.Context, limit *entity.CategoryLimit) error
	GetCategoryLimits(ctx context.Context, userID string, month string) ([]*entity.CategoryLimit, error)
	GetCategoryLimit(ctx context.Context, id string, userID string) (*entity.CategoryLimit, error)
	UpdateCategoryLimit(ctx context.Context, limit *entity.CategoryLimit) error
}
