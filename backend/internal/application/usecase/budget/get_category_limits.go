package budget

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain/repository"
)

type GetCategoryLimitsUseCase struct {
	budgetRepo repository.BudgetRepository
}

func NewGetCategoryLimitsUseCase(budgetRepo repository.BudgetRepository) *GetCategoryLimitsUseCase {
	return &GetCategoryLimitsUseCase{budgetRepo: budgetRepo}
}

func (uc *GetCategoryLimitsUseCase) Execute(ctx context.Context, userID string, month string) ([]*dto.CategoryLimitResponse, error) {
	if month == "" {
		month = time.Now().Format("2006-01")
	}

	limits, err := uc.budgetRepo.GetCategoryLimits(ctx, userID, month)
	if err != nil {
		return nil, err
	}

	responses := make([]*dto.CategoryLimitResponse, len(limits))
	for i, limit := range limits {
		responses[i] = &dto.CategoryLimitResponse{
			ID:           limit.ID,
			CategoryID:   limit.CategoryID,
			Month:        limit.Month,
			Limit:        limit.Limit,
			Spent:        limit.Spent,
			Remaining:    limit.Remaining(),
			UsagePercent: limit.UsagePercent(),
			IsExceeded:   limit.IsExceeded(),
			UpdatedAt:    limit.UpdatedAt,
		}
	}

	return responses, nil
}
