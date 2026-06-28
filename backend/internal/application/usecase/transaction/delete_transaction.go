package transaction

import (
	"context"

	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type DeleteTransactionUseCase struct {
	transactionRepo repository.TransactionRepository
	accountRepo     repository.AccountRepository
}

func NewDeleteTransactionUseCase(
	transactionRepo repository.TransactionRepository,
	accountRepo repository.AccountRepository,
) *DeleteTransactionUseCase {
	return &DeleteTransactionUseCase{
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
	}
}

func (uc *DeleteTransactionUseCase) Execute(ctx context.Context, id string, userID string) error {
	transaction, err := uc.transactionRepo.GetByID(ctx, id, userID)
	if err != nil {
		return err
	}

	account, err := uc.accountRepo.GetByID(ctx, transaction.AccountID, userID)
	if err != nil {
		return err
	}

	switch transaction.Type {
	case entity.TransactionTypeIncome:
		account.UpdateBalance(-transaction.Amount)
	case entity.TransactionTypeExpense:
		account.UpdateBalance(transaction.Amount)
	case entity.TransactionTypeTransfer:
		toAccount, err := uc.accountRepo.GetByID(ctx, transaction.ToAccountID, userID)
		if err != nil {
			return err
		}
		account.UpdateBalance(transaction.Amount)
		toAccount.UpdateBalance(-transaction.Amount)
		if err := uc.accountRepo.Update(ctx, toAccount); err != nil {
			return err
		}
	}

	if err := uc.accountRepo.Update(ctx, account); err != nil {
		return err
	}

	return uc.transactionRepo.Delete(ctx, id, userID)
}
