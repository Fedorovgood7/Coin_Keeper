package goal

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/repository"
)

type UpdateGoalUseCase struct {
	goalRepo repository.GoalRepository
}

func NewUpdateGoalUseCase(goalRepo repository.GoalRepository) *UpdateGoalUseCase {
	return &UpdateGoalUseCase{goalRepo: goalRepo}
}

func (uc *UpdateGoalUseCase) Execute(ctx context.Context, userID string, goalID string, req dto.UpdateGoalRequest) (*dto.GoalResponse, error) {
	goal, err := uc.goalRepo.GetByID(ctx, goalID, userID)
	if err != nil {
		return nil, err
	}

	if req.Title != nil {
		goal.Title = *req.Title
	}

	if req.TargetAmount != nil {
		goal.TargetAmount = *req.TargetAmount
	}

	if req.Deadline != nil {
		goal.Deadline = *req.Deadline
	}

	goal.UpdatedAt = time.Now()

	if err := uc.goalRepo.Update(ctx, goal); err != nil {
		return nil, err
	}

	progress := 0.0
	if goal.TargetAmount > 0 {
		progress = (goal.CurrentAmount / goal.TargetAmount) * 100
		if progress > 100 {
			progress = 100
		}
	}

	return &dto.GoalResponse{
		ID:            goal.ID,
		Title:         goal.Title,
		TargetAmount:  goal.TargetAmount,
		CurrentAmount: goal.CurrentAmount,
		Progress:      progress,
		Deadline:      goal.Deadline,
		Status:        string(goal.Status),
		CreatedAt:     goal.CreatedAt,
		UpdatedAt:     goal.UpdatedAt,
	}, nil
}
