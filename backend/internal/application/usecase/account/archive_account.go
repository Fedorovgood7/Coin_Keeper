package account

import (
	"context"

	"coinkeeper/internal/domain/repository"
)

type ArchiveAccountUseCase struct {
	accountRepo repository.AccountRepository
}

func NewArchiveAccountUseCase(accountRepo repository.AccountRepository) *ArchiveAccountUseCase {
	return &ArchiveAccountUseCase{accountRepo: accountRepo}
}

func (uc *ArchiveAccountUseCase) Execute(ctx context.Context, id string, userID string) error {
	account, err := uc.accountRepo.GetByID(ctx, id, userID)
	if err != nil {
		return err
	}

	account.Archive()

	return uc.accountRepo.Update(ctx, account)
}
