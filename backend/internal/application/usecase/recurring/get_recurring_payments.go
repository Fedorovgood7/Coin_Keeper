package recurring

import (
	"context"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/repository"
)

type GetRecurringPaymentsUseCase struct {
	recurringRepo repository.RecurringRepository
}

func NewGetRecurringPaymentsUseCase(recurringRepo repository.RecurringRepository) *GetRecurringPaymentsUseCase {
	return &GetRecurringPaymentsUseCase{recurringRepo: recurringRepo}
}

func (uc *GetRecurringPaymentsUseCase) Execute(ctx context.Context, userID string) ([]*dto.RecurringResponse, error) {
	recurringPayments, err := uc.recurringRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.RecurringResponse, len(recurringPayments))
	for i, recurring := range recurringPayments {
		responses[i] = &dto.RecurringResponse{
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
		}
	}

	return responses, nil
}
