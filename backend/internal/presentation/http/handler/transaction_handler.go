package handler

import (
	"encoding/json"
	"net/http"
	"time"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/application/usecase/transaction"
	"coinkeeper/internal/presentation/http/middleware"
	"coinkeeper/internal/presentation/http/response"

	"github.com/gorilla/mux"
)

type TransactionHandler struct {
	createTransactionUC *transaction.CreateTransactionUseCase
	getTransactionsUC   *transaction.GetTransactionsUseCase
	updateTransactionUC *transaction.UpdateTransactionUseCase
	deleteTransactionUC *transaction.DeleteTransactionUseCase
}

func NewTransactionHandler(
	createUC *transaction.CreateTransactionUseCase,
	getUC *transaction.GetTransactionsUseCase,
	updateUC *transaction.UpdateTransactionUseCase,
	deleteUC *transaction.DeleteTransactionUseCase,
) *TransactionHandler {
	return &TransactionHandler{
		createTransactionUC: createUC,
		getTransactionsUC:   getUC,
		updateTransactionUC: updateUC,
		deleteTransactionUC: deleteUC,
	}
}

func (h *TransactionHandler) CreateTransaction(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	var req dto.CreateTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	if req.Type == "" || req.Amount <= 0 || req.AccountID == "" || req.CategoryID == "" {
		response.BadRequest(w, "Type, amount, account_id and category_id are required")
		return
	}

	result, err := h.createTransactionUC.Execute(r.Context(), userID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.Created(w, result)
}

func (h *TransactionHandler) GetTransactions(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	req := dto.TransactionFilterRequest{}

	if dateFrom := r.URL.Query().Get("date_from"); dateFrom != "" {
		t, err := time.Parse(time.RFC3339, dateFrom)
		if err == nil {
			req.DateFrom = &t
		}
	}

	if dateTo := r.URL.Query().Get("date_to"); dateTo != "" {
		t, err := time.Parse(time.RFC3339, dateTo)
		if err == nil {
			req.DateTo = &t
		}
	}

	req.AccountID = r.URL.Query().Get("account_id")
	req.CategoryID = r.URL.Query().Get("category_id")
	req.Type = r.URL.Query().Get("type")

	result, err := h.getTransactionsUC.Execute(r.Context(), userID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}

func (h *TransactionHandler) UpdateTransaction(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	vars := mux.Vars(r)
	id := vars["id"]

	var req dto.UpdateTransactionRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	req.ID = id

	result, err := h.updateTransactionUC.Execute(r.Context(), userID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}

func (h *TransactionHandler) DeleteTransaction(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.deleteTransactionUC.Execute(r.Context(), id, userID); err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, map[string]string{"message": "Transaction deleted"})
}
