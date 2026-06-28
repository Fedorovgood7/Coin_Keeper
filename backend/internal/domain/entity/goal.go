package entity

import "time"

type GoalStatus string

const (
	GoalStatusActive    GoalStatus = "active"
	GoalStatusCompleted GoalStatus = "completed"
	GoalStatusFailed    GoalStatus = "failed"
)

type SavingsGoal struct {
	ID            string
	UserID        string
	Title         string
	TargetAmount  float64
	CurrentAmount float64
	Deadline      time.Time
	Status        GoalStatus
	CreatedAt     time.Time
	UpdatedAt     time.Time
}

func (g *SavingsGoal) Topup(amount float64) {
	g.CurrentAmount += amount
	if g.CurrentAmount >= g.TargetAmount {
		g.Status = GoalStatusCompleted
	}
	g.UpdatedAt = time.Now()
}

func (g *SavingsGoal) Progress() float64 {
	if g.TargetAmount == 0 {
		return 0
	}
	return (g.CurrentAmount / g.TargetAmount) * 100
}

func (g *SavingsGoal) IsOverdue() bool {
	return time.Now().After(g.Deadline) && g.Status == GoalStatusActive
}

func (g *SavingsGoal) UpdateStatus() {
	if g.CurrentAmount >= g.TargetAmount {
		g.Status = GoalStatusCompleted
	} else if g.IsOverdue() {
		g.Status = GoalStatusFailed
	}
	g.UpdatedAt = time.Now()
}
