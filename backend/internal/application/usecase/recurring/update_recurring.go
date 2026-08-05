package recurring

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type UpdateRecurringUseCase struct {
	recurringRepo repository.RecurringRepository
}

func NewUpdateRecurringUseCase(recurringRepo repository.RecurringRepository) *UpdateRecurringUseCase {
	return &UpdateRecurringUseCase{recurringRepo: recurringRepo}
}

func (uc *UpdateRecurringUseCase) Execute(ctx context.Context, userID string, id string, req dto.UpdateRecurringRequest) (*dto.RecurringResponse, error) {
	recurring, err := uc.recurringRepo.GetByID(ctx, id, userID)
	if err != nil {
		return nil, err
	}

	if req.Type != nil {
		if *req.Type != "income" && *req.Type != "expense" && *req.Type != "transfer" {
			return nil, domain.ErrInvalidInput
		}
		recurring.Type = entity.TransactionType(*req.Type)
	}

	if req.Amount != nil {
		if *req.Amount <= 0 {
			return nil, domain.ErrInvalidInput
		}
		recurring.Amount = *req.Amount
	}

	if req.AccountID != nil {
		recurring.AccountID = *req.AccountID
	}

	if req.ToAccountID != nil {
		recurring.ToAccountID = *req.ToAccountID
	}

	if req.CategoryID != nil {
		recurring.CategoryID = *req.CategoryID
	}

	if req.Periodicity != nil {
		if *req.Periodicity != "daily" && *req.Periodicity != "weekly" && *req.Periodicity != "monthly" {
			return nil, domain.ErrInvalidInput
		}
		recurring.Periodicity = entity.Periodicity(*req.Periodicity)
	}

	if req.NextDate != nil {
		recurring.NextDate = *req.NextDate
	}

	if req.Comment != nil {
		recurring.Comment = *req.Comment
	}

	if req.IsActive != nil {
		recurring.IsActive = *req.IsActive
	}

	recurring.UpdatedAt = time.Now()

	if err := uc.recurringRepo.Update(ctx, recurring); err != nil {
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
