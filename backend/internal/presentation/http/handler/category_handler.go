package handler

import (
	"encoding/json"
	"net/http"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/application/usecase/category"
	"coinkeeper/internal/presentation/http/middleware"
	"coinkeeper/internal/presentation/http/response"

	"github.com/gorilla/mux"
)

type CategoryHandler struct {
	getCategoriesUC  *category.GetCategoriesUseCase
	updateCategoryUC *category.UpdateCategoryUseCase
}

func NewCategoryHandler(
	getUC *category.GetCategoriesUseCase,
	updateUC *category.UpdateCategoryUseCase,
) *CategoryHandler {
	return &CategoryHandler{
		getCategoriesUC:  getUC,
		updateCategoryUC: updateUC,
	}
}

func (h *CategoryHandler) GetCategories(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	result, err := h.getCategoriesUC.Execute(r.Context(), userID)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}

func (h *CategoryHandler) UpdateCategory(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	vars := mux.Vars(r)
	id := vars["id"]

	var req dto.UpdateCategoryRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	req.ID = id

	result, err := h.updateCategoryUC.Execute(r.Context(), userID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}
