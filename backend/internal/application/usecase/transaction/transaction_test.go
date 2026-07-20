package transaction

import (
	"context"
	"errors"
	"testing"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type mockTxRepo struct {
	transactions map[string]*entity.Transaction
	err          error
}

func newMockTxRepo() *mockTxRepo {
	return &mockTxRepo{transactions: make(map[string]*entity.Transaction)}
}

func (m *mockTxRepo) Create(ctx context.Context, tx *entity.Transaction) error {
	if m.err != nil {
		return m.err
	}
	m.transactions[tx.ID] = tx
	return nil
}

func (m *mockTxRepo) GetByID(ctx context.Context, id string, userID string) (*entity.Transaction, error) {
	tx, ok := m.transactions[id]
	if !ok {
		return nil, domain.ErrNotFound
	}
	return tx, nil
}

func (m *mockTxRepo) GetByFilter(ctx context.Context, filter repository.TransactionFilter) ([]*entity.Transaction, error) {
	var result []*entity.Transaction
	for _, tx := range m.transactions {
		if tx.UserID == filter.UserID {
			result = append(result, tx)
		}
	}
	return result, nil
}

func (m *mockTxRepo) Update(ctx context.Context, tx *entity.Transaction) error {
	if m.err != nil {
		return m.err
	}
	m.transactions[tx.ID] = tx
	return nil
}

func (m *mockTxRepo) Delete(ctx context.Context, id string, userID string) error {
	if m.err != nil {
		return m.err
	}
	delete(m.transactions, id)
	return nil
}

func (m *mockTxRepo) GetTotalByCategory(ctx context.Context, userID string, month string) (map[string]float64, error) {
	return map[string]float64{}, nil
}

func (m *mockTxRepo) GetDailyTotals(ctx context.Context, userID string, month string) (map[string]float64, error) {
	return map[string]float64{}, nil
}

func (m *mockTxRepo) GetIncomeTotal(ctx context.Context, userID string, month string) (float64, error) {
	return 0, nil
}

func (m *mockTxRepo) GetExpenseTotal(ctx context.Context, userID string, month string) (float64, error) {
	return 0, nil
}

type mockAccRepo struct {
	accounts map[string]*entity.Account
	err      error
}

func newMockAccRepo() *mockAccRepo {
	return &mockAccRepo{accounts: make(map[string]*entity.Account)}
}

func (m *mockAccRepo) Create(ctx context.Context, account *entity.Account) error {
	m.accounts[account.ID] = account
	return nil
}

func (m *mockAccRepo) GetByID(ctx context.Context, id string, userID string) (*entity.Account, error) {
	acc, ok := m.accounts[id]
	if !ok {
		return nil, domain.ErrNotFound
	}
	return acc, nil
}

func (m *mockAccRepo) GetByUserID(ctx context.Context, userID string) ([]*entity.Account, error) {
	var result []*entity.Account
	for _, acc := range m.accounts {
		if acc.UserID == userID {
			result = append(result, acc)
		}
	}
	return result, nil
}

func (m *mockAccRepo) Update(ctx context.Context, account *entity.Account) error {
	if m.err != nil {
		return m.err
	}
	m.accounts[account.ID] = account
	return nil
}

func (m *mockAccRepo) Archive(ctx context.Context, id string, userID string) error {
	return nil
}

type mockBudgetRepo struct{}

func (m *mockBudgetRepo) Create(ctx context.Context, budget *entity.MonthlyBudget) error {
	return nil
}

func (m *mockBudgetRepo) GetByMonth(ctx context.Context, userID string, month string) (*entity.MonthlyBudget, error) {
	return nil, domain.ErrNotFound
}

func (m *mockBudgetRepo) Update(ctx context.Context, budget *entity.MonthlyBudget) error {
	return nil
}

func (m *mockBudgetRepo) CreateCategoryLimit(ctx context.Context, limit *entity.CategoryLimit) error {
	return nil
}

func (m *mockBudgetRepo) GetCategoryLimits(ctx context.Context, userID string, month string) ([]*entity.CategoryLimit, error) {
	return nil, nil
}

func (m *mockBudgetRepo) GetCategoryLimit(ctx context.Context, id string, userID string) (*entity.CategoryLimit, error) {
	return nil, domain.ErrNotFound
}

func (m *mockBudgetRepo) UpdateCategoryLimit(ctx context.Context, limit *entity.CategoryLimit) error {
	return nil
}

func TestCreateTransactionUseCase_Execute(t *testing.T) {
	ctx := context.Background()
	userID := "user-123"

	t.Run("create income transaction", func(t *testing.T) {
		txRepo := newMockTxRepo()
		accRepo := newMockAccRepo()
		budgetRepo := &mockBudgetRepo{}

		accRepo.accounts["acc-1"] = &entity.Account{
			ID:       "acc-1",
			UserID:   userID,
			Name:     "Test Account",
			Type:     entity.AccountTypeCard,
			Currency: entity.CurrencyRUB,
			Balance:  1000,
		}

		uc := NewCreateTransactionUseCase(txRepo, accRepo, budgetRepo)

		req := dto.CreateTransactionRequest{
			Type:       "income",
			Amount:     500,
			AccountID:  "acc-1",
			CategoryID: "cat-1",
			Date:       time.Now(),
		}

		result, err := uc.Execute(ctx, userID, req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if result.Type != "income" {
			t.Errorf("expected type 'income', got %q", result.Type)
		}
		if result.Amount != 500 {
			t.Errorf("expected amount 500, got %f", result.Amount)
		}

		acc := accRepo.accounts["acc-1"]
		if acc.Balance != 1500 {
			t.Errorf("expected balance 1500, got %f", acc.Balance)
		}
	})

	t.Run("create expense with insufficient funds", func(t *testing.T) {
		txRepo := newMockTxRepo()
		accRepo := newMockAccRepo()
		budgetRepo := &mockBudgetRepo{}

		accRepo.accounts["acc-1"] = &entity.Account{
			ID:       "acc-1",
			UserID:   userID,
			Name:     "Test Account",
			Type:     entity.AccountTypeCard,
			Currency: entity.CurrencyRUB,
			Balance:  100,
		}

		uc := NewCreateTransactionUseCase(txRepo, accRepo, budgetRepo)

		req := dto.CreateTransactionRequest{
			Type:       "expense",
			Amount:     500,
			AccountID:  "acc-1",
			CategoryID: "cat-1",
			Date:       time.Now(),
		}

		_, err := uc.Execute(ctx, userID, req)
		if !errors.Is(err, domain.ErrInsufficientFunds) {
			t.Errorf("expected ErrInsufficientFunds, got %v", err)
		}
	})

	t.Run("create transfer", func(t *testing.T) {
		txRepo := newMockTxRepo()
		accRepo := newMockAccRepo()
		budgetRepo := &mockBudgetRepo{}

		accRepo.accounts["acc-1"] = &entity.Account{
			ID:       "acc-1",
			UserID:   userID,
			Name:     "Source",
			Type:     entity.AccountTypeCard,
			Currency: entity.CurrencyRUB,
			Balance:  1000,
		}
		accRepo.accounts["acc-2"] = &entity.Account{
			ID:       "acc-2",
			UserID:   userID,
			Name:     "Target",
			Type:     entity.AccountTypeCash,
			Currency: entity.CurrencyRUB,
			Balance:  500,
		}

		uc := NewCreateTransactionUseCase(txRepo, accRepo, budgetRepo)

		req := dto.CreateTransactionRequest{
			Type:        "transfer",
			Amount:      300,
			AccountID:   "acc-1",
			ToAccountID: "acc-2",
			CategoryID:  "cat-1",
			Date:        time.Now(),
		}

		result, err := uc.Execute(ctx, userID, req)
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}

		if result.Type != "transfer" {
			t.Errorf("expected type 'transfer', got %q", result.Type)
		}

		if accRepo.accounts["acc-1"].Balance != 700 {
			t.Errorf("expected source balance 700, got %f", accRepo.accounts["acc-1"].Balance)
		}
		if accRepo.accounts["acc-2"].Balance != 800 {
			t.Errorf("expected target balance 800, got %f", accRepo.accounts["acc-2"].Balance)
		}
	})

	t.Run("archived account", func(t *testing.T) {
		txRepo := newMockTxRepo()
		accRepo := newMockAccRepo()
		budgetRepo := &mockBudgetRepo{}

		accRepo.accounts["acc-1"] = &entity.Account{
			ID:         "acc-1",
			UserID:     userID,
			Name:       "Archived",
			Type:       entity.AccountTypeCard,
			Currency:   entity.CurrencyRUB,
			Balance:    1000,
			IsArchived: true,
		}

		uc := NewCreateTransactionUseCase(txRepo, accRepo, budgetRepo)

		req := dto.CreateTransactionRequest{
			Type:       "income",
			Amount:     500,
			AccountID:  "acc-1",
			CategoryID: "cat-1",
			Date:       time.Now(),
		}

		_, err := uc.Execute(ctx, userID, req)
		if !errors.Is(err, domain.ErrAccountArchived) {
			t.Errorf("expected ErrAccountArchived, got %v", err)
		}
	})
}
