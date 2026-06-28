package goal

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type CreateGoalUseCase struct {
	goalRepo repository.GoalRepository
}

func NewCreateGoalUseCase(goalRepo repository.GoalRepository) *CreateGoalUseCase {
	return &CreateGoalUseCase{goalRepo: goalRepo}
}

func (uc *CreateGoalUseCase) Execute(ctx context.Context, userID string, req dto.CreateGoalRequest) (*dto.GoalResponse, error) {
	goal := &entity.SavingsGoal{
		UserID:        userID,
		Title:         req.Title,
		TargetAmount:  req.TargetAmount,
		CurrentAmount: 0,
		Deadline:      req.Deadline,
		Status:        entity.GoalStatusActive,
		CreatedAt:     time.Now(),
		UpdatedAt:     time.Now(),
	}

	if err := uc.goalRepo.Create(ctx, goal); err != nil {
		return nil, err
	}

	return &dto.GoalResponse{
		ID:            goal.ID,
		Title:         goal.Title,
		TargetAmount:  goal.TargetAmount,
		CurrentAmount: goal.CurrentAmount,
		Progress:      goal.Progress(),
		Deadline:      goal.Deadline,
		Status:        string(goal.Status),
		CreatedAt:     goal.CreatedAt,
		UpdatedAt:     goal.UpdatedAt,
	}, nil
}
