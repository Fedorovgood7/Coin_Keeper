package handler

import (
	"encoding/json"
	"log"
	"net/http"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/application/usecase/recurring"
	"coinkeeper/internal/presentation/http/middleware"
	"coinkeeper/internal/presentation/http/response"
)

type RecurringHandler struct {
	createRecurringUC      *recurring.CreateRecurringUseCase
	getRecurringPaymentsUC *recurring.GetRecurringPaymentsUseCase
	generateTransactionsUC *recurring.GenerateTransactionsUseCase
}

func NewRecurringHandler(
	createUC *recurring.CreateRecurringUseCase,
	getUC *recurring.GetRecurringPaymentsUseCase,
	generateUC *recurring.GenerateTransactionsUseCase,
) *RecurringHandler {
	return &RecurringHandler{
		createRecurringUC:      createUC,
		getRecurringPaymentsUC: getUC,
		generateTransactionsUC: generateUC,
	}
}

func (h *RecurringHandler) CreateRecurring(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	var req dto.CreateRecurringRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	if req.Type == "" || req.Amount <= 0 || req.AccountID == "" || req.CategoryID == "" || req.Periodicity == "" {
		response.BadRequest(w, "Type, amount, account_id, category_id and periodicity are required")
		return
	}

	result, err := h.createRecurringUC.Execute(r.Context(), userID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.Created(w, result)
}

func (h *RecurringHandler) GetRecurringPayments(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	result, err := h.getRecurringPaymentsUC.Execute(r.Context(), userID)
	if err != nil {
		log.Printf("[recurring] error for user %s: %v", userID, err)
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}

func (h *RecurringHandler) GenerateTransactions(w http.ResponseWriter, r *http.Request) {
	if err := h.generateTransactionsUC.Execute(r.Context()); err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, map[string]string{"message": "Transactions generated"})
}
