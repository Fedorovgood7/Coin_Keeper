package account

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type CreateAccountUseCase struct {
	accountRepo repository.AccountRepository
}

func NewCreateAccountUseCase(accountRepo repository.AccountRepository) *CreateAccountUseCase {
	return &CreateAccountUseCase{accountRepo: accountRepo}
}

func (uc *CreateAccountUseCase) Execute(ctx context.Context, userID string, req dto.CreateAccountRequest) (*dto.AccountResponse, error) {
	if req.InitialBalance < 0 {
		return nil, domain.ErrInvalidInput
	}

	account := &entity.Account{
		UserID:         userID,
		Name:           req.Name,
		Type:           entity.AccountType(req.Type),
		Currency:       entity.Currency(req.Currency),
		InitialBalance: req.InitialBalance,
		Balance:        req.InitialBalance,
		IsArchived:     false,
		CreatedAt:      time.Now(),
		UpdatedAt:      time.Now(),
	}

	if err := uc.accountRepo.Create(ctx, account); err != nil {
		return nil, err
	}

	return &dto.AccountResponse{
		ID:             account.ID,
		Name:           account.Name,
		Type:           string(account.Type),
		Currency:       string(account.Currency),
		Balance:        account.Balance,
		InitialBalance: account.InitialBalance,
		IsArchived:     account.IsArchived,
		CreatedAt:      account.CreatedAt,
	}, nil
}
