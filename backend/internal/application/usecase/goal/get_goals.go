package goal

import (
	"context"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/repository"
)

type GetGoalsUseCase struct {
	goalRepo repository.GoalRepository
}

func NewGetGoalsUseCase(goalRepo repository.GoalRepository) *GetGoalsUseCase {
	return &GetGoalsUseCase{goalRepo: goalRepo}
}

func (uc *GetGoalsUseCase) Execute(ctx context.Context, userID string) ([]*dto.GoalResponse, error) {
	goals, err := uc.goalRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.GoalResponse, len(goals))
	for i, goal := range goals {
		goal.UpdateStatus()

		responses[i] = &dto.GoalResponse{
			ID:            goal.ID,
			Title:         goal.Title,
			TargetAmount:  goal.TargetAmount,
			CurrentAmount: goal.CurrentAmount,
			Progress:      goal.Progress(),
			Deadline:      goal.Deadline,
			Status:        string(goal.Status),
			CreatedAt:     goal.CreatedAt,
			UpdatedAt:     goal.UpdatedAt,
		}
	}

	return responses, nil
}
