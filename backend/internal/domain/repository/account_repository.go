package repository

import (
	"context"
	"coinkeeper/internal/domain/entity"
)

type AccountRepository interface {
	Create(ctx context.Context, account *entity.Account) error
	GetByID(ctx context.Context, id string, userID string) (*entity.Account, error)
	GetByUserID(ctx context.Context, userID string) ([]*entity.Account, error)
	Update(ctx context.Context, account *entity.Account) error
	Archive(ctx context.Context, id string, userID string) error
}
