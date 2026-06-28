package recurring

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type GenerateTransactionsUseCase struct {
	recurringRepo   repository.RecurringRepository
	transactionRepo repository.TransactionRepository
	accountRepo     repository.AccountRepository
}

func NewGenerateTransactionsUseCase(
	recurringRepo repository.RecurringRepository,
	transactionRepo repository.TransactionRepository,
	accountRepo repository.AccountRepository,
) *GenerateTransactionsUseCase {
	return &GenerateTransactionsUseCase{
		recurringRepo:   recurringRepo,
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
	}
}

func (uc *GenerateTransactionsUseCase) Execute(ctx context.Context) error {
	duePayments, err := uc.recurringRepo.GetDuePayments(ctx)
	if err != nil {
		return err
	}

	for _, recurring := range duePayments {
		if !recurring.IsActive {
			continue
		}

		transaction := &entity.Transaction{
			UserID:      recurring.UserID,
			Type:        recurring.Type,
			Amount:      recurring.Amount,
			AccountID:   recurring.AccountID,
			ToAccountID: recurring.ToAccountID,
			CategoryID:  recurring.CategoryID,
			Date:        recurring.NextDate,
			Comment:     recurring.Comment,
			RecurringID: recurring.ID,
			CreatedAt:   time.Now(),
		}

		if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
			continue
		}

		account, err := uc.accountRepo.GetByID(ctx, recurring.AccountID, recurring.UserID)
		if err != nil {
			continue
		}

		switch recurring.Type {
		case entity.TransactionTypeIncome:
			account.UpdateBalance(recurring.Amount)
		case entity.TransactionTypeExpense:
			account.UpdateBalance(-recurring.Amount)
		case entity.TransactionTypeTransfer:
			toAccount, err := uc.accountRepo.GetByID(ctx, recurring.ToAccountID, recurring.UserID)
			if err != nil {
				continue
			}
			account.UpdateBalance(-recurring.Amount)
			toAccount.UpdateBalance(recurring.Amount)
			uc.accountRepo.Update(ctx, toAccount)
		}

		uc.accountRepo.Update(ctx, account)

		recurring.NextDate = recurring.CalculateNextDate()
		recurring.UpdatedAt = time.Now()
		uc.recurringRepo.Update(ctx, recurring)
	}

	return nil
}
