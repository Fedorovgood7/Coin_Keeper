package entity

import "time"

type TransactionType string

const (
	TransactionTypeIncome   TransactionType = "income"
	TransactionTypeExpense  TransactionType = "expense"
	TransactionTypeTransfer TransactionType = "transfer"
)

type Transaction struct {
	ID          string
	UserID      string
	Type        TransactionType
	Amount      float64
	AccountID   string
	ToAccountID string
	CategoryID  string
	Date        time.Time
	Comment     string
	RecurringID string
	CreatedAt   time.Time
}

func (t *Transaction) IsTransfer() bool {
	return t.Type == TransactionTypeTransfer
}

func (t *Transaction) IsExpense() bool {
	return t.Type == TransactionTypeExpense
}

func (t *Transaction) IsIncome() bool {
	return t.Type == TransactionTypeIncome
}
