package dashboard

import (
	"context"
	"sort"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type GetDashboardDataUseCase struct {
	accountRepo     repository.AccountRepository
	transactionRepo repository.TransactionRepository
	budgetRepo      repository.BudgetRepository
	recurringRepo   repository.RecurringRepository
	categoryRepo    repository.CategoryRepository
}

func NewGetDashboardDataUseCase(
	accountRepo repository.AccountRepository,
	transactionRepo repository.TransactionRepository,
	budgetRepo repository.BudgetRepository,
	recurringRepo repository.RecurringRepository,
	categoryRepo repository.CategoryRepository,
) *GetDashboardDataUseCase {
	return &GetDashboardDataUseCase{
		accountRepo:     accountRepo,
		transactionRepo: transactionRepo,
		budgetRepo:      budgetRepo,
		recurringRepo:   recurringRepo,
		categoryRepo:    categoryRepo,
	}
}

func (uc *GetDashboardDataUseCase) Execute(ctx context.Context, userID string) (*dto.DashboardResponse, error) {
	accounts, err := uc.accountRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	totalBalance := 0.0
	for _, account := range accounts {
		if !account.IsArchived {
			totalBalance += account.Balance
		}
	}

	currentMonth := time.Now().Format("2006-01")

	monthlyIncome, err := uc.transactionRepo.GetIncomeTotal(ctx, userID, currentMonth)
	if err != nil {
		return nil, err
	}

	monthlyExpense, err := uc.transactionRepo.GetExpenseTotal(ctx, userID, currentMonth)
	if err != nil {
		return nil, err
	}

	budgetRemaining := 0.0
	safeDailyAmount := 0.0
	budget, err := uc.budgetRepo.GetByMonth(ctx, userID, currentMonth)
	if err == nil {
		budgetRemaining = budget.RemainingAmount()
		safeDailyAmount = budget.SafeDailyAmount
	}

	categoryTotals, err := uc.transactionRepo.GetTotalByCategory(ctx, userID, currentMonth)
	if err != nil {
		return nil, err
	}

	categories, err := uc.categoryRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	categoryMap := make(map[string]string)
	for _, cat := range categories {
		categoryMap[cat.ID] = cat.Name
	}

	topCategories := uc.buildTopCategories(categoryTotals, categoryMap, monthlyExpense)

	recurringPayments, err := uc.recurringRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	upcomingRecurring := uc.getUpcomingRecurring(recurringPayments)

	return &dto.DashboardResponse{
		TotalBalance:      totalBalance,
		MonthlyIncome:     monthlyIncome,
		MonthlyExpense:    monthlyExpense,
		BudgetRemaining:   budgetRemaining,
		SafeDailyAmount:   safeDailyAmount,
		TopCategories:     topCategories,
		UpcomingRecurring: upcomingRecurring,
	}, nil
}

func (uc *GetDashboardDataUseCase) buildTopCategories(categoryTotals map[string]float64, categoryMap map[string]string, totalExpense float64) []dto.CategoryStatItem {
	items := make([]dto.CategoryStatItem, 0, len(categoryTotals))

	for categoryID, amount := range categoryTotals {
		name := categoryMap[categoryID]
		if name == "" {
			name = "Unknown"
		}

		percent := 0.0
		if totalExpense > 0 {
			percent = (amount / totalExpense) * 100
		}

		items = append(items, dto.CategoryStatItem{
			CategoryID: categoryID,
			Name:       name,
			Amount:     amount,
			Percent:    percent,
		})
	}

	sort.Slice(items, func(i, j int) bool {
		return items[i].Amount > items[j].Amount
	})

	if len(items) > 5 {
		items = items[:5]
	}

	return items
}

func (uc *GetDashboardDataUseCase) getUpcomingRecurring(recurringPayments []*entity.RecurringPayment) []dto.RecurringResponse {
	upcoming := make([]dto.RecurringResponse, 0)

	now := time.Now()
	weekLater := now.AddDate(0, 0, 7)

	for _, recurring := range recurringPayments {
		if !recurring.IsActive {
			continue
		}
		if recurring.NextDate.After(now) && recurring.NextDate.Before(weekLater) || recurring.NextDate.Equal(now) {
			upcoming = append(upcoming, dto.RecurringResponse{
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
			})
		}
	}

	sort.Slice(upcoming, func(i, j int) bool {
		return upcoming[i].NextDate.Before(upcoming[j].NextDate)
	})

	if len(upcoming) > 5 {
		upcoming = upcoming[:5]
	}

	return upcoming
}
