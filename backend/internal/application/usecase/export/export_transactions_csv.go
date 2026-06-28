package export

import (
	"context"
	"strconv"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/repository"
)

type ExportTransactionsCSVUseCase struct {
	transactionRepo repository.TransactionRepository
}

func NewExportTransactionsCSVUseCase(transactionRepo repository.TransactionRepository) *ExportTransactionsCSVUseCase {
	return &ExportTransactionsCSVUseCase{transactionRepo: transactionRepo}
}

func (uc *ExportTransactionsCSVUseCase) Execute(ctx context.Context, userID string, req dto.ExportCSVRequest) ([][]string, error) {
	filter := repository.TransactionFilter{
		UserID:   userID,
		DateFrom: req.DateFrom,
		DateTo:   req.DateTo,
	}

	transactions, err := uc.transactionRepo.GetByFilter(ctx, filter)
	if err != nil {
		return nil, err
	}

	records := [][]string{
		{"ID", "Type", "Amount", "AccountID", "CategoryID", "Date", "Comment", "CreatedAt"},
	}

	for _, t := range transactions {
		records = append(records, []string{
			t.ID,
			string(t.Type),
			strconv.FormatFloat(t.Amount, 'f', 2, 64),
			t.AccountID,
			t.CategoryID,
			t.Date.Format(time.RFC3339),
			t.Comment,
			t.CreatedAt.Format(time.RFC3339),
		})
	}

	return records, nil
}
