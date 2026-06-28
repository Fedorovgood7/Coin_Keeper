package repository

import (
	"context"
	"coinkeeper/internal/domain/entity"
)

type CategoryRepository interface {
	Create(ctx context.Context, category *entity.Category) error
	GetByID(ctx context.Context, id string, userID string) (*entity.Category, error)
	GetByUserID(ctx context.Context, userID string) ([]*entity.Category, error)
	GetDefaultCategories(ctx context.Context) ([]*entity.Category, error)
	Update(ctx context.Context, category *entity.Category) error
}
