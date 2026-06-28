package goal

import (
	"context"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/repository"
)

type TopupGoalUseCase struct {
	goalRepo    repository.GoalRepository
	accountRepo repository.AccountRepository
}

func NewTopupGoalUseCase(
	goalRepo repository.GoalRepository,
	accountRepo repository.AccountRepository,
) *TopupGoalUseCase {
	return &TopupGoalUseCase{
		goalRepo:    goalRepo,
		accountRepo: accountRepo,
	}
}

func (uc *TopupGoalUseCase) Execute(ctx context.Context, userID string, goalID string, req dto.TopupGoalRequest) (*dto.GoalResponse, error) {
	goal, err := uc.goalRepo.GetByID(ctx, goalID, userID)
	if err != nil {
		return nil, err
	}

	account, err := uc.accountRepo.GetByID(ctx, req.AccountID, userID)
	if err != nil {
		return nil, err
	}

	if !account.HasSufficientFunds(req.Amount) {
		return nil, domain.ErrInsufficientFunds
	}

	account.UpdateBalance(-req.Amount)
	if err := uc.accountRepo.Update(ctx, account); err != nil {
		return nil, err
	}

	goal.Topup(req.Amount)
	if err := uc.goalRepo.Update(ctx, goal); err != nil {
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
