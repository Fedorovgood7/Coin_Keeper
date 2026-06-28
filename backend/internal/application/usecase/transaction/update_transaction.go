package transaction

import (
	"context"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type UpdateTransactionUseCase struct {
	transactionRepo repository.TransactionRepository
	accountRepo     repository.AccountRepository
}

func NewUpdateTransactionUseCase(
	transactionRepo repository.TransactionRepository,
	accountRepo repository.AccountRepository,
) *UpdateTransactionUseCase {
	return &UpdateTransactionUseCase{
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
	}
}

func (uc *UpdateTransactionUseCase) Execute(ctx context.Context, userID string, req dto.UpdateTransactionRequest) (*dto.TransactionResponse, error) {
	transaction, err := uc.transactionRepo.GetByID(ctx, req.ID, userID)
	if err != nil {
		return nil, err
	}

	account, err := uc.accountRepo.GetByID(ctx, transaction.AccountID, userID)
	if err != nil {
		return nil, err
	}

	oldAmount := transaction.Amount

	if req.Amount != nil {
		newAmount := *req.Amount

		if transaction.Type == entity.TransactionTypeExpense {
			if !account.HasSufficientFunds(newAmount) {
				return nil, domain.ErrInsufficientFunds
			}
		}

		switch transaction.Type {
		case entity.TransactionTypeIncome:
			account.UpdateBalance(newAmount - oldAmount)
		case entity.TransactionTypeExpense:
			account.UpdateBalance(-(newAmount - oldAmount))
		}

		transaction.Amount = newAmount
	}

	if req.CategoryID != nil {
		transaction.CategoryID = *req.CategoryID
	}

	if req.Date != nil {
		transaction.Date = *req.Date
	}

	if req.Comment != nil {
		transaction.Comment = *req.Comment
	}

	if err := uc.transactionRepo.Update(ctx, transaction); err != nil {
		return nil, err
	}

	if err := uc.accountRepo.Update(ctx, account); err != nil {
		return nil, err
	}

	return &dto.TransactionResponse{
		ID:          transaction.ID,
		Type:        string(transaction.Type),
		Amount:      transaction.Amount,
		AccountID:   transaction.AccountID,
		ToAccountID: transaction.ToAccountID,
		CategoryID:  transaction.CategoryID,
		Date:        transaction.Date,
		Comment:     transaction.Comment,
		CreatedAt:   transaction.CreatedAt,
	}, nil
}
