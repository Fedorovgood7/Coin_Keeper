package handler

import (
	"encoding/json"
	"net/http"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/application/usecase/account"
	"coinkeeper/internal/presentation/http/middleware"
	"coinkeeper/internal/presentation/http/response"

	"github.com/gorilla/mux"
)

type AccountHandler struct {
	createAccountUC  *account.CreateAccountUseCase
	getAccountsUC    *account.GetAccountsUseCase
	updateAccountUC  *account.UpdateAccountUseCase
	archiveAccountUC *account.ArchiveAccountUseCase
}

func NewAccountHandler(
	createUC *account.CreateAccountUseCase,
	getUC *account.GetAccountsUseCase,
	updateUC *account.UpdateAccountUseCase,
	archiveUC *account.ArchiveAccountUseCase,
) *AccountHandler {
	return &AccountHandler{
		createAccountUC:  createUC,
		getAccountsUC:    getUC,
		updateAccountUC:  updateUC,
		archiveAccountUC: archiveUC,
	}
}

func (h *AccountHandler) CreateAccount(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	var req dto.CreateAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	if req.Name == "" {
		response.BadRequest(w, "Name is required")
		return
	}
	if req.Type == "" {
		response.BadRequest(w, "Type is required")
		return
	}
	if req.Currency == "" {
		response.BadRequest(w, "Currency is required")
		return
	}

	result, err := h.createAccountUC.Execute(r.Context(), userID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.Created(w, result)
}

func (h *AccountHandler) GetAccounts(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	result, err := h.getAccountsUC.Execute(r.Context(), userID)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}

func (h *AccountHandler) UpdateAccount(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	vars := mux.Vars(r)
	id := vars["id"]

	var req dto.UpdateAccountRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	req.ID = id

	result, err := h.updateAccountUC.Execute(r.Context(), userID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}

func (h *AccountHandler) ArchiveAccount(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	vars := mux.Vars(r)
	id := vars["id"]

	if err := h.archiveAccountUC.Execute(r.Context(), id, userID); err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, map[string]string{"message": "Account archived"})
}
