package budget

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/repository"
)

type CalculateSafeDailyAmountUseCase struct {
	budgetRepo repository.BudgetRepository
}

func NewCalculateSafeDailyAmountUseCase(budgetRepo repository.BudgetRepository) *CalculateSafeDailyAmountUseCase {
	return &CalculateSafeDailyAmountUseCase{budgetRepo: budgetRepo}
}

func (uc *CalculateSafeDailyAmountUseCase) Execute(ctx context.Context, userID string, month string) (*dto.SafeDailyAmountResponse, error) {
	budget, err := uc.budgetRepo.GetByMonth(ctx, userID, month)
	if err != nil {
		if err == domain.ErrNotFound {
			return &dto.SafeDailyAmountResponse{
				Month:           month,
				SafeDailyAmount: 0,
				RemainingDays:   0,
			}, nil
		}
		return nil, err
	}

	monthTime, err := time.Parse("2006-01", month)
	if err != nil {
		return nil, err
	}

	now := time.Now()
	daysInMonth := daysInMonth(monthTime)

	currentDay := now.Day()
	if monthTime.Month() != now.Month() || monthTime.Year() != now.Year() {
		currentDay = 0
	}

	remainingDays := daysInMonth - currentDay + 1
	if remainingDays <= 0 {
		remainingDays = 1
	}

	remaining := budget.RemainingAmount()
	if remaining <= 0 {
		return &dto.SafeDailyAmountResponse{
			Month:           month,
			SafeDailyAmount: 0,
			RemainingDays:   remainingDays,
		}, nil
	}

	safeDailyAmount := remaining / float64(remainingDays)

	return &dto.SafeDailyAmountResponse{
		Month:           month,
		SafeDailyAmount: safeDailyAmount,
		RemainingDays:   remainingDays,
	}, nil
}
