package recurring

import (
	"context"

	"coinkeeper/internal/domain/repository"
)

type DeleteRecurringUseCase struct {
	recurringRepo repository.RecurringRepository
}

func NewDeleteRecurringUseCase(recurringRepo repository.RecurringRepository) *DeleteRecurringUseCase {
	return &DeleteRecurringUseCase{recurringRepo: recurringRepo}
}

func (uc *DeleteRecurringUseCase) Execute(ctx context.Context, id string, userID string) error {
	return uc.recurringRepo.Delete(ctx, id, userID)
}
