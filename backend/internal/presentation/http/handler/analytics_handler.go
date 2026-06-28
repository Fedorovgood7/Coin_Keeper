package handler

import (
	"net/http"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/application/usecase/analytics"
	"coinkeeper/internal/presentation/http/middleware"
	"coinkeeper/internal/presentation/http/response"
)

type AnalyticsHandler struct {
	getCategoryStatsUC           *analytics.GetCategoryStatsUseCase
	getDailyStatsUC              *analytics.GetDailyStatsUseCase
	getIncomeExpenseComparisonUC *analytics.GetIncomeExpenseComparisonUseCase
}

func NewAnalyticsHandler(
	getCategoryStatsUC *analytics.GetCategoryStatsUseCase,
	getDailyStatsUC *analytics.GetDailyStatsUseCase,
	getIncomeExpenseComparisonUC *analytics.GetIncomeExpenseComparisonUseCase,
) *AnalyticsHandler {
	return &AnalyticsHandler{
		getCategoryStatsUC:           getCategoryStatsUC,
		getDailyStatsUC:              getDailyStatsUC,
		getIncomeExpenseComparisonUC: getIncomeExpenseComparisonUC,
	}
}

func (h *AnalyticsHandler) GetCategoryStats(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	month := r.URL.Query().Get("month")
	if month == "" {
		month = time.Now().Format("2006-01")
	}

	req := dto.CategoryStatsRequest{Month: month}

	result, err := h.getCategoryStatsUC.Execute(r.Context(), userID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}

func (h *AnalyticsHandler) GetDailyStats(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	month := r.URL.Query().Get("month")
	if month == "" {
		month = time.Now().Format("2006-01")
	}

	req := dto.DailyStatsRequest{Month: month}

	result, err := h.getDailyStatsUC.Execute(r.Context(), userID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}

func (h *AnalyticsHandler) GetIncomeExpenseComparison(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	month := r.URL.Query().Get("month")
	if month == "" {
		month = time.Now().Format("2006-01")
	}

	req := dto.IncomeExpenseComparisonRequest{Month: month}

	result, err := h.getIncomeExpenseComparisonUC.Execute(r.Context(), userID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}
