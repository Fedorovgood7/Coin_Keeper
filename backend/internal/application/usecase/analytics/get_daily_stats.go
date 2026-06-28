package analytics

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/repository"
)

type GetDailyStatsUseCase struct {
	transactionRepo repository.TransactionRepository
}

func NewGetDailyStatsUseCase(transactionRepo repository.TransactionRepository) *GetDailyStatsUseCase {
	return &GetDailyStatsUseCase{transactionRepo: transactionRepo}
}

func (uc *GetDailyStatsUseCase) Execute(ctx context.Context, userID string, req dto.DailyStatsRequest) (*dto.DailyStatsResponse, error) {
	dailyTotals, err := uc.transactionRepo.GetDailyTotals(ctx, userID, req.Month)
	if err != nil {
		return nil, err
	}

	monthTime, err := time.Parse("2006-01", req.Month)
	if err != nil {
		return nil, err
	}

	daysInMonth := time.Date(monthTime.Year(), monthTime.Month()+1, 0, 0, 0, 0, 0, time.UTC).Day()

	days := make([]dto.DailyStatItem, daysInMonth)
	for i := 0; i < daysInMonth; i++ {
		day := i + 1
		date := time.Date(monthTime.Year(), monthTime.Month(), day, 0, 0, 0, 0, time.UTC)
		dateStr := date.Format("2006-01-02")

		amount := 0.0
		if total, ok := dailyTotals[dateStr]; ok {
			amount = total
		}

		days[i] = dto.DailyStatItem{
			Date:   dateStr,
			Amount: amount,
		}
	}

	return &dto.DailyStatsResponse{
		Month: req.Month,
		Days:  days,
	}, nil
}
