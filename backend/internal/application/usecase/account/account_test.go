package account

import (
	"context"
	"errors"
	"testing"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/entity"
)

type mockAccountRepo struct {
	accounts map[string]*entity.Account
	err      error
}

func newMockRepo() *mockAccountRepo {
	return &mockAccountRepo{accounts: make(map[string]*entity.Account)}
}

func (m *mockAccountRepo) Create(ctx context.Context, account *entity.Account) error {
	if m.err != nil {
		return m.err
	}
	m.accounts[account.ID] = account
	return nil
}

func (m *mockAccountRepo) GetByID(ctx context.Context, id string, userID string) (*entity.Account, error) {
	acc, ok := m.accounts[id]
	if !ok {
		return nil, domain.ErrNotFound
	}
	return acc, nil
}

func (m *mockAccountRepo) GetByUserID(ctx context.Context, userID string) ([]*entity.Account, error) {
	var result []*entity.Account
	for _, acc := range m.accounts {
		if acc.UserID == userID {
			result = append(result, acc)
		}
	}
	return result, nil
}

func (m *mockAccountRepo) Update(ctx context.Context, account *entity.Account) error {
	if m.err != nil {
		return m.err
	}
	m.accounts[account.ID] = account
	return nil
}

func (m *mockAccountRepo) Archive(ctx context.Context, id string, userID string) error {
	if m.err != nil {
		return m.err
	}
	if acc, ok := m.accounts[id]; ok {
		acc.IsArchived = true
	}
	return nil
}

func TestCreateAccountUseCase_Execute(t *testing.T) {
	ctx := context.Background()
	userID := "user-123"

	t.Run("success", func(t *testing.T) {
		repo := newMockRepo()
		uc := NewCreateAccountUseCase(repo)

		req := dto.CreateAccountRequest{
			Name:           "Test Account",
			Type:           "card",
			Currency:       "RUB",
			InitialBalance: 1000.0,
		}

		result, err := uc.Execute(ctx, userID, req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if result.Name != req.Name {
			t.Errorf("expected name %q, got %q", req.Name, result.Name)
		}
		if result.Balance != req.InitialBalance {
			t.Errorf("expected balance %f, got %f", req.InitialBalance, result.Balance)
		}
		if result.IsArchived {
			t.Error("expected is_archived to be false")
		}
	})

	t.Run("negative initial balance", func(t *testing.T) {
		repo := newMockRepo()
		uc := NewCreateAccountUseCase(repo)

		req := dto.CreateAccountRequest{
			Name:           "Test Account",
			Type:           "card",
			Currency:       "RUB",
			InitialBalance: -100.0,
		}

		_, err := uc.Execute(ctx, userID, req)
		if !errors.Is(err, domain.ErrInvalidInput) {
			t.Errorf("expected ErrInvalidInput, got %v", err)
		}
	})

	t.Run("repository error", func(t *testing.T) {
		repo := newMockRepo()
		repo.err = errors.New("db error")
		uc := NewCreateAccountUseCase(repo)

		req := dto.CreateAccountRequest{
			Name:           "Test Account",
			Type:           "card",
			Currency:       "RUB",
			InitialBalance: 1000.0,
		}

		_, err := uc.Execute(ctx, userID, req)
		if err == nil {
			t.Error("expected error, got nil")
		}
	})
}

func TestGetAccountsUseCase_Execute(t *testing.T) {
	ctx := context.Background()
	userID := "user-123"

	t.Run("success", func(t *testing.T) {
		repo := newMockRepo()
		repo.accounts["acc-1"] = &entity.Account{
			ID:       "acc-1",
			UserID:   userID,
			Name:     "Account 1",
			Type:     entity.AccountTypeCard,
			Currency: entity.CurrencyRUB,
			Balance:  1000,
		}
		repo.accounts["acc-2"] = &entity.Account{
			ID:       "acc-2",
			UserID:   "other-user",
			Name:     "Account 2",
			Type:     entity.AccountTypeCash,
			Currency: entity.CurrencyRUB,
			Balance:  500,
		}

		uc := NewGetAccountsUseCase(repo)
		result, err := uc.Execute(ctx, userID)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if len(result) != 1 {
			t.Fatalf("expected 1 account, got %d", len(result))
		}
		if result[0].Name != "Account 1" {
			t.Errorf("expected name 'Account 1', got %q", result[0].Name)
		}
	})
}
