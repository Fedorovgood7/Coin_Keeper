package handler

import (
	"encoding/json"
	"net/http"

	"coinkeeper/internal/application/dto"
	"coinkeeper/internal/application/usecase/goal"
	"coinkeeper/internal/presentation/http/middleware"
	"coinkeeper/internal/presentation/http/response"

	"github.com/gorilla/mux"
)

type GoalHandler struct {
	createGoalUC *goal.CreateGoalUseCase
	getGoalsUC   *goal.GetGoalsUseCase
	topupGoalUC  *goal.TopupGoalUseCase
}

func NewGoalHandler(
	createUC *goal.CreateGoalUseCase,
	getUC *goal.GetGoalsUseCase,
	topupUC *goal.TopupGoalUseCase,
) *GoalHandler {
	return &GoalHandler{
		createGoalUC: createUC,
		getGoalsUC:   getUC,
		topupGoalUC:  topupUC,
	}
}

func (h *GoalHandler) CreateGoal(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	var req dto.CreateGoalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	if req.Title == "" || req.TargetAmount <= 0 {
		response.BadRequest(w, "Title and valid target_amount are required")
		return
	}

	result, err := h.createGoalUC.Execute(r.Context(), userID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.Created(w, result)
}

func (h *GoalHandler) GetGoals(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())

	result, err := h.getGoalsUC.Execute(r.Context(), userID)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}

func (h *GoalHandler) TopupGoal(w http.ResponseWriter, r *http.Request) {
	userID := middleware.GetUserID(r.Context())
	vars := mux.Vars(r)
	goalID := vars["id"]

	var req dto.TopupGoalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		response.BadRequest(w, "Invalid request body")
		return
	}

	if req.Amount <= 0 || req.AccountID == "" {
		response.BadRequest(w, "Valid amount and account_id are required")
		return
	}

	result, err := h.topupGoalUC.Execute(r.Context(), userID, goalID, req)
	if err != nil {
		response.HandleDomainError(w, err)
		return
	}

	response.OK(w, result)
}
