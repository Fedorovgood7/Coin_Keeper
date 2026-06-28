package repository

import (
	"context"
	"coinkeeper/internal/domain/entity"
)

type GoalRepository interface {
	Create(ctx context.Context, goal *entity.SavingsGoal) error
	GetByID(ctx context.Context, id string, userID string) (*entity.SavingsGoal, error)
	GetByUserID(ctx context.Context, userID string) ([]*entity.SavingsGoal, error)
	Update(ctx context.Context, goal *entity.SavingsGoal) error
}
