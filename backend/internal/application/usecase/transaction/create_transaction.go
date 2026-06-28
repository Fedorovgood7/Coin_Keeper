package transaction

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type CreateTransactionUseCase struct {
	transactionRepo repository.TransactionRepository
	accountRepo     repository.AccountRepository
	budgetRepo      repository.BudgetRepository
}

func NewCreateTransactionUseCase(
	transactionRepo repository.TransactionRepository,
	accountRepo repository.AccountRepository,
	budgetRepo repository.BudgetRepository,
) *CreateTransactionUseCase {
	return &CreateTransactionUseCase{
		transactionRepo: transactionRepo,
		accountRepo:     accountRepo,
		budgetRepo:      budgetRepo,
	}
}

func (uc *CreateTransactionUseCase) Execute(ctx context.Context, userID string, req dto.CreateTransactionRequest) (*dto.TransactionResponse, error) {
	account, err := uc.accountRepo.GetByID(ctx, req.AccountID, userID)
	if err != nil {
		return nil, err
	}

	if account.IsArchived {
		return nil, domain.ErrAccountArchived
	}

	if req.Type == string(entity.TransactionTypeExpense) {
		if !account.HasSufficientFunds(req.Amount) {
			return nil, domain.ErrInsufficientFunds
		}
	}

	transaction := &entity.Transaction{
		UserID:      userID,
		Type:        entity.TransactionType(req.Type),
		Amount:      req.Amount,
		AccountID:   req.AccountID,
		ToAccountID: req.ToAccountID,
		CategoryID:  req.CategoryID,
		Date:        req.Date,
		Comment:     req.Comment,
		CreatedAt:   time.Now(),
	}

	switch transaction.Type {
	case entity.TransactionTypeIncome:
		account.UpdateBalance(req.Amount)
	case entity.TransactionTypeExpense:
		account.UpdateBalance(-req.Amount)
	case entity.TransactionTypeTransfer:
		if req.ToAccountID == "" {
			return nil, domain.ErrInvalidInput
		}
		toAccount, err := uc.accountRepo.GetByID(ctx, req.ToAccountID, userID)
		if err != nil {
			return nil, err
		}
		if toAccount.IsArchived {
			return nil, domain.ErrAccountArchived
		}
		account.UpdateBalance(-req.Amount)
		toAccount.UpdateBalance(req.Amount)
		if err := uc.accountRepo.Update(ctx, toAccount); err != nil {
			return nil, err
		}
	}

	if err := uc.transactionRepo.Create(ctx, transaction); err != nil {
		return nil, err
	}

	if err := uc.accountRepo.Update(ctx, account); err != nil {
		return nil, err
	}

	if transaction.Type == entity.TransactionTypeExpense {
		uc.checkBudgetLimit(ctx, userID, req.CategoryID, req.Amount)
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

func (uc *CreateTransactionUseCase) checkBudgetLimit(ctx context.Context, userID, categoryID string, amount float64) {
	month := time.Now().Format("2006-01")
	limits, err := uc.budgetRepo.GetCategoryLimits(ctx, userID, month)
	if err != nil {
		return
	}

	for _, limit := range limits {
		if limit.CategoryID == categoryID {
			limit.AddSpent(amount)
			uc.budgetRepo.UpdateCategoryLimit(ctx, limit)
			break
		}
	}
}
