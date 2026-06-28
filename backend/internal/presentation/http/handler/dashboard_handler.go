package handler

import (
	"net/http"

	"coinkeeper/internal/application/usecase/dashboard"
	"coinkeeper/internal/presentation/http/middleware"
	"coinkeeper/internal/presentation/http/response"
)

type DashboardHandler struct {
	getDashboardDataUC *dashboard.GetDashboardDataUseCase
}

func NewDashboardHandler(getDashboardDataUC *dashboard.GetDashboardDataUseCase) *DashboardHandler {
	return &DashboardHandler{getDashboardDataUC: getDashboardDataUC}
}

func (h *DashboardHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	result, err := h.getDashboardDataUC.Execute(r.Context(), userID)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}
