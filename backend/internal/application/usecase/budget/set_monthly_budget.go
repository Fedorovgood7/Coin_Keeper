package budget

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type SetMonthlyBudgetUseCase struct {
	budgetRepo repository.BudgetRepository
}

func NewSetMonthlyBudgetUseCase(budgetRepo repository.BudgetRepository) *SetMonthlyBudgetUseCase {
	return &SetMonthlyBudgetUseCase{budgetRepo: budgetRepo}
}

func (uc *SetMonthlyBudgetUseCase) Execute(ctx context.Context, userID string, req dto.SetMonthlyBudgetRequest) (*dto.MonthlyBudgetResponse, error) {
	if req.PlannedAmount <= 0 {
		return nil, domain.ErrInvalidInput
	}

	if req.Month == "" {
		req.Month = time.Now().Format("2006-01")
	}

	budget, err := uc.budgetRepo.GetByMonth(ctx, userID, req.Month)
	if err != nil {
		if err == domain.ErrNotFound {
			budget = &entity.MonthlyBudget{
				UserID:          userID,
				Month:           req.Month,
				PlannedAmount:   req.PlannedAmount,
				ActualAmount:    0,
				SafeDailyAmount: 0,
				CreatedAt:       time.Now(),
				UpdatedAt:       time.Now(),
			}
			if err := uc.budgetRepo.Create(ctx, budget); err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	} else {
		budget.PlannedAmount = req.PlannedAmount
		budget.UpdatedAt = time.Now()
		if err := uc.budgetRepo.Update(ctx, budget); err != nil {
			return nil, err
		}
	}

	return &dto.MonthlyBudgetResponse{
		ID:              budget.ID,
		Month:           budget.Month,
		PlannedAmount:   budget.PlannedAmount,
		ActualAmount:    budget.ActualAmount,
		UsagePercent:    budget.CalculateUsagePercent(),
		RemainingAmount: budget.RemainingAmount(),
		SafeDailyAmount: budget.SafeDailyAmount,
		UpdatedAt:       budget.UpdatedAt,
	}, nil
}
