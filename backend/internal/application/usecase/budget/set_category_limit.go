package budget

import (
	"context"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/domain"
	"coinkeeper/internal/domain/entity"
	"coinkeeper/internal/domain/repository"
)

type SetCategoryLimitUseCase struct {
	budgetRepo repository.BudgetRepository
}

func NewSetCategoryLimitUseCase(budgetRepo repository.BudgetRepository) *SetCategoryLimitUseCase {
	return &SetCategoryLimitUseCase{budgetRepo: budgetRepo}
}

func (uc *SetCategoryLimitUseCase) Execute(ctx context.Context, userID string, req dto.SetCategoryLimitRequest) (*dto.CategoryLimitResponse, error) {
	if req.Limit <= 0 {
		return nil, domain.ErrInvalidInput
	}

	limit, err := uc.budgetRepo.GetCategoryLimit(ctx, req.CategoryID, userID)
	if err != nil {
		if err == domain.ErrNotFound {
			limit = &entity.CategoryLimit{
				UserID:     userID,
				CategoryID: req.CategoryID,
				Month:      req.Month,
				Limit:      req.Limit,
				Spent:      0,
				CreatedAt:  time.Now(),
				UpdatedAt:  time.Now(),
			}
			if err := uc.budgetRepo.CreateCategoryLimit(ctx, limit); err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	} else {
		limit.Limit = req.Limit
		limit.UpdatedAt = time.Now()
		if err := uc.budgetRepo.UpdateCategoryLimit(ctx, limit); err != nil {
			return nil, err
		}
	}

	return &dto.CategoryLimitResponse{
		ID:           limit.ID,
		CategoryID:   limit.CategoryID,
		Month:        limit.Month,
		Limit:        limit.Limit,
		Spent:        limit.Spent,
		Remaining:    limit.Remaining(),
		UsagePercent: limit.UsagePercent(),
		IsExceeded:   limit.IsExceeded(),
		UpdatedAt:    limit.UpdatedAt,
	}, nil
}
