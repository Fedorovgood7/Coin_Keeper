package transaction

import (
	"context"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type GetTransactionsUseCase struct {
	transactionRepo repository.TransactionRepository
}

func NewGetTransactionsUseCase(transactionRepo repository.TransactionRepository) *GetTransactionsUseCase {
	return &GetTransactionsUseCase{transactionRepo: transactionRepo}
}

func (uc *GetTransactionsUseCase) Execute(ctx context.Context, userID string, req dto.TransactionFilterRequest) ([]*dto.TransactionResponse, error) {
	filter := repository.TransactionFilter{
		UserID:     userID,
		DateFrom:   req.DateFrom,
		DateTo:     req.DateTo,
		AccountID:  req.AccountID,
		CategoryID: req.CategoryID,
		Type:       entity.TransactionType(req.Type),
	}

	transactions, err := uc.transactionRepo.GetByFilter(ctx, filter)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.TransactionResponse, len(transactions))
	for i, transaction := range transactions {
		responses[i] = &dto.TransactionResponse{
			ID:          transaction.ID,
			Type:        string(transaction.Type),
			Amount:      transaction.Amount,
			AccountID:   transaction.AccountID,
			ToAccountID: transaction.ToAccountID,
			CategoryID:  transaction.CategoryID,
			Date:        transaction.Date,
			Comment:     transaction.Comment,
			CreatedAt:   transaction.CreatedAt,
		}
	}

	return responses, nil
}
