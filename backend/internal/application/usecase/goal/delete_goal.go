package goal

import (
	"context"

	"coinkeeper/internal/domain/repository"
)

type DeleteGoalUseCase struct {
	goalRepo repository.GoalRepository
}

func NewDeleteGoalUseCase(goalRepo repository.GoalRepository) *DeleteGoalUseCase {
	return &DeleteGoalUseCase{goalRepo: goalRepo}
}

func (uc *DeleteGoalUseCase) Execute(ctx context.Context, id string, userID string) error {
	return uc.goalRepo.Delete(ctx, id, userID)
}
