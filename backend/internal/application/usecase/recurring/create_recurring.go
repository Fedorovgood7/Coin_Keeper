package recurring

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type CreateRecurringUseCase struct {
	recurringRepo repository.RecurringRepository
}

func NewCreateRecurringUseCase(recurringRepo repository.RecurringRepository) *CreateRecurringUseCase {
	return &CreateRecurringUseCase{recurringRepo: recurringRepo}
}

func (uc *CreateRecurringUseCase) Execute(ctx context.Context, userID string, req dto.CreateRecurringRequest) (*dto.RecurringResponse, error) {
	recurring := &entity.RecurringPayment{
		UserID:      userID,
		Type:        entity.TransactionType(req.Type),
		Amount:      req.Amount,
		AccountID:   req.AccountID,
		ToAccountID: req.ToAccountID,
		CategoryID:  req.CategoryID,
		Periodicity: entity.Periodicity(req.Periodicity),
		NextDate:    req.NextDate,
		Comment:     req.Comment,
		IsActive:    true,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	if err := uc.recurringRepo.Create(ctx, recurring); err != nil {
		return nil, err
	}

	return &dto.RecurringResponse{
		ID:          recurring.ID,
		Type:        string(recurring.Type),
		Amount:      recurring.Amount,
		AccountID:   recurring.AccountID,
		ToAccountID: recurring.ToAccountID,
		CategoryID:  recurring.CategoryID,
		Periodicity: string(recurring.Periodicity),
		NextDate:    recurring.NextDate,
		Comment:     recurring.Comment,
		IsActive:    recurring.IsActive,
		CreatedAt:   recurring.CreatedAt,
	}, nil
}
