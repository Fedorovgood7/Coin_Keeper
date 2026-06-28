package account

import (
	"context"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/repository"
)

type UpdateAccountUseCase struct {
	accountRepo repository.AccountRepository
}

func NewUpdateAccountUseCase(accountRepo repository.AccountRepository) *UpdateAccountUseCase {
	return &UpdateAccountUseCase{accountRepo: accountRepo}
}

func (uc *UpdateAccountUseCase) Execute(ctx context.Context, userID string, req dto.UpdateAccountRequest) (*dto.AccountResponse, error) {
	account, err := uc.accountRepo.GetByID(ctx, req.ID, userID)
	if err != nil {
		return nil, err
	}

	if req.Name != nil {
		account.Name = *req.Name
	}

	if err := uc.accountRepo.Update(ctx, account); err != nil {
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
