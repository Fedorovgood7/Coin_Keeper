package repository

import (
	"context"
	"coinkeeper/internal/domain/entity"
)

type RecurringRepository interface {
	Create(ctx context.Context, recurring *entity.RecurringPayment) error
	GetByID(ctx context.Context, id string, userID string) (*entity.RecurringPayment, error)
	GetByUserID(ctx context.Context, userID string) ([]*entity.RecurringPayment, error)
	GetDuePayments(ctx context.Context) ([]*entity.RecurringPayment, error)
	Update(ctx context.Context, recurring *entity.RecurringPayment) error
}
