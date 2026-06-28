package entity

import "time"

type AccountType string

const (
	AccountTypeCash    AccountType = "cash"
	AccountTypeCard    AccountType = "card"
	AccountTypeDeposit AccountType = "deposit"
)

type Currency string

const (
	CurrencyRUB Currency = "RUB"
	CurrencyUSD Currency = "USD"
	CurrencyEUR Currency = "EUR"
)

type Account struct {
	ID             string
	UserID         string
	Name           string
	Type           AccountType
	Currency       Currency
	Balance        float64
	InitialBalance float64
	IsArchived     bool
	CreatedAt      time.Time
	UpdatedAt      time.Time
}

func (a *Account) UpdateBalance(amount float64) {
	a.Balance += amount
	a.UpdatedAt = time.Now()
}

func (a *Account) Archive() {
	a.IsArchived = true
	a.UpdatedAt = time.Now()
}

func (a *Account) Unarchive() {
	a.IsArchived = false
	a.UpdatedAt = time.Now()
}

func (a *Account) HasSufficientFunds(amount float64) bool {
	return a.Balance >= amount
}
