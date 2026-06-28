package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/application/usecase/budget"
	"coinkeeper/internal/presentation/http/middleware"
	"coinkeeper/internal/presentation/http/response"
)

type BudgetHandler struct {
	getMonthlyBudgetUC        *budget.GetMonthlyBudgetUseCase
	setCategoryLimitUC        *budget.SetCategoryLimitUseCase
	calculateSafeDailyAmountUC *budget.CalculateSafeDailyAmountUseCase
}

func NewBudgetHandler(
	getMonthlyBudgetUC *budget.GetMonthlyBudgetUseCase,
	setCategoryLimitUC *budget.SetCategoryLimitUseCase,
	calculateSafeDailyAmountUC *budget.CalculateSafeDailyAmountUseCase,
) *BudgetHandler {
	return &BudgetHandler{
		getMonthlyBudgetUC:        getMonthlyBudgetUC,
		setCategoryLimitUC:        setCategoryLimitUC,
		calculateSafeDailyAmountUC: calculateSafeDailyAmountUC,
	}
}

func (h *BudgetHandler) GetMonthlyBudget(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	month := r.URL.Query().Get("month")
	if month == "" {
		month = time.Now().Format("2006-01")
	}

	result, err := h.getMonthlyBudgetUC.Execute(r.Context(), userID, month)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}

func (h *BudgetHandler) SetCategoryLimit(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	var req dto.SetCategoryLimitRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	if req.CategoryID == "" || req.Limit <= 0 {
		response.BadRequest(w, "Category_id and valid limit are required")
		return
	}

	if req.Month == "" {
		req.Month = time.Now().Format("2006-01")
	}

	result, err := h.setCategoryLimitUC.Execute(r.Context(), userID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}

func (h *BudgetHandler) GetSafeDailyAmount(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	month := r.URL.Query().Get("month")
	if month == "" {
		month = time.Now().Format("2006-01")
	}

	result, err := h.calculateSafeDailyAmountUC.Execute(r.Context(), userID, month)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}
