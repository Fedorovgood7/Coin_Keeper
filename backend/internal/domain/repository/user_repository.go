package repository

import (
	"context"
	"coinkeeper/internal/domain/entity"
)

type UserRepository interface {
	Create(ctx context.Context, user *entity.User) error
	GetByID(ctx context.Context, id string) (*entity.User, error)
	GetByYandexID(ctx context.Context, yandexID string) (*entity.User, error)
	Update(ctx context.Context, user *entity.User) error
}
