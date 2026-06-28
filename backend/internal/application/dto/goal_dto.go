package dto

import "time"

type CreateGoalRequest struct {
	Title        string    `json:"title" validate:"required,min=1,max=200"`
	TargetAmount float64   `json:"target_amount" validate:"required,gt=0"`
	Deadline     time.Time `json:"deadline" validate:"required"`
}

type TopupGoalRequest struct {
	Amount    float64 `json:"amount" validate:"required,gt=0"`
	AccountID string  `json:"account_id" validate:"required"`
}

type GoalResponse struct {
	ID            string    `json:"id"`
	Title         string    `json:"title"`
	TargetAmount  float64   `json:"target_amount"`
	CurrentAmount float64   `json:"current_amount"`
	Progress      float64   `json:"progress"`
	Deadline      time.Time `json:"deadline"`
	Status        string    `json:"status"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
}
