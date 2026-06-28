package analytics

import (
	"context"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/repository"
)

type GetIncomeExpenseComparisonUseCase struct {
	transactionRepo repository.TransactionRepository
}

func NewGetIncomeExpenseComparisonUseCase(transactionRepo repository.TransactionRepository) *GetIncomeExpenseComparisonUseCase {
	return &GetIncomeExpenseComparisonUseCase{transactionRepo: transactionRepo}
}

func (uc *GetIncomeExpenseComparisonUseCase) Execute(ctx context.Context, userID string, req dto.IncomeExpenseComparisonRequest) (*dto.IncomeExpenseComparisonResponse, error) {
	income, err := uc.transactionRepo.GetIncomeTotal(ctx, userID, req.Month)
	if err != nil {
		return nil, err
	}

	expense, err := uc.transactionRepo.GetExpenseTotal(ctx, userID, req.Month)
	if err != nil {
		return nil, err
	}

	saving := income - expense

	return &dto.IncomeExpenseComparisonResponse{
		Month:   req.Month,
		Income:  income,
		Expense: expense,
		Saving:  saving,
	}, nil
}
