package entity

import "time"

type Periodicity string

const (
	PeriodicityDaily   Periodicity = "daily"
	PeriodicityWeekly  Periodicity = "weekly"
	PeriodicityMonthly Periodicity = "monthly"
)

type RecurringPayment struct {
	ID          string
	UserID      string
	Type        TransactionType
	Amount      float64
	AccountID   string
	ToAccountID string
	CategoryID  string
	Periodicity Periodicity
	NextDate    time.Time
	Comment     string
	IsActive    bool
	CreatedAt   time.Time
	UpdatedAt   time.Time
}

func (r *RecurringPayment) CalculateNextDate() time.Time {
	switch r.Periodicity {
	case PeriodicityDaily:
		return r.NextDate.AddDate(0, 0, 1)
	case PeriodicityWeekly:
		return r.NextDate.AddDate(0, 0, 7)
	case PeriodicityMonthly:
		return r.NextDate.AddDate(0, 1, 0)
	default:
		return r.NextDate
	}
}

func (r *RecurringPayment) IsDue() bool {
	return time.Now().After(r.NextDate) || time.Now().Equal(r.NextDate)
}

func (r *RecurringPayment) Deactivate() {
	r.IsActive = false
	r.UpdatedAt = time.Now()
}
