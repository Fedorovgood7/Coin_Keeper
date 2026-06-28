package budget

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type GetMonthlyBudgetUseCase struct {
	budgetRepo      repository.BudgetRepository
	transactionRepo repository.TransactionRepository
}

func NewGetMonthlyBudgetUseCase(
	budgetRepo repository.BudgetRepository,
	transactionRepo repository.TransactionRepository,
) *GetMonthlyBudgetUseCase {
	return &GetMonthlyBudgetUseCase{
		budgetRepo:      budgetRepo,
		transactionRepo: transactionRepo,
	}
}

func (uc *GetMonthlyBudgetUseCase) Execute(ctx context.Context, userID string, month string) (*dto.MonthlyBudgetResponse, error) {
	budget, err := uc.budgetRepo.GetByMonth(ctx, userID, month)
	if err != nil {
		if err == domain.ErrNotFound {
			return nil, domain.ErrNotFound
		}
		return nil, err
	}

	expenseTotal, err := uc.transactionRepo.GetExpenseTotal(ctx, userID, month)
	if err != nil {
		return nil, err
	}

	budget.UpdateActual(expenseTotal)

	safeDailyAmount := uc.calculateSafeDailyAmount(budget, month)
	budget.SafeDailyAmount = safeDailyAmount

	if err := uc.budgetRepo.Update(ctx, budget); err != nil {
		return nil, err
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

func (uc *GetMonthlyBudgetUseCase) calculateSafeDailyAmount(budget *entity.MonthlyBudget, month string) float64 {
	monthTime, err := time.Parse("2006-01", month)
	if err != nil {
		return 0
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
		return 0
	}

	return remaining / float64(remainingDays)
}

func daysInMonth(t time.Time) int {
	return time.Date(t.Year(), t.Month()+1, 0, 0, 0, 0, 0, t.Location()).Day()
}
