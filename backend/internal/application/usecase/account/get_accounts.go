package account

import (
	"context"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/repository"
)

type GetAccountsUseCase struct {
	accountRepo repository.AccountRepository
}

func NewGetAccountsUseCase(accountRepo repository.AccountRepository) *GetAccountsUseCase {
	return &GetAccountsUseCase{accountRepo: accountRepo}
}

func (uc *GetAccountsUseCase) Execute(ctx context.Context, userID string) ([]*dto.AccountResponse, error) {
	accounts, err := uc.accountRepo.GetByUserID(ctx, userID)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.AccountResponse, len(accounts))
	for i, account := range accounts {
		responses[i] = &dto.AccountResponse{
			ID:             account.ID,
			Name:           account.Name,
			Type:           string(account.Type),
			Currency:       string(account.Currency),
			Balance:        account.Balance,
			InitialBalance: account.InitialBalance,
			IsArchived:     account.IsArchived,
			CreatedAt:      account.CreatedAt,
		}
	}

	return responses, nil
}
