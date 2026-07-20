package http

import (
	"net/http"

	"coinkeeper/internal/domain/service"
	"coinkeeper/internal/presentation/http/handler"
	"coinkeeper/internal/presentation/http/middleware"

	"github.com/gorilla/mux"
)

type Handlers struct {
	Auth        *handler.AuthHandler
	Account     *handler.AccountHandler
	Category    *handler.CategoryHandler
	Transaction *handler.TransactionHandler
	Budget      *handler.BudgetHandler
	Dashboard   *handler.DashboardHandler
	Analytics   *handler.AnalyticsHandler
	Recurring   *handler.RecurringHandler
	Goal        *handler.GoalHandler
	Export      *handler.ExportHandler
}

func NewRouter(sessionService service.SessionService, handlers *Handlers) http.Handler {
	r := mux.NewRouter()

	r.Use(middleware.Recovery)
	r.Use(middleware.Logger)
	r.Use(middleware.CORS)

	api := r.PathPrefix("/api/v1").Subrouter()

	api.HandleFunc("/auth/yandex", handlers.Auth.LoginWithYandex).Methods(http.MethodPost, http.MethodOptions)

	protected := api.PathPrefix("").Subrouter()
	protected.Use(middleware.Auth(sessionService))

	protected.HandleFunc("/auth/me", handlers.Auth.GetProfile).Methods(http.MethodGet, http.MethodOptions)
	protected.HandleFunc("/auth/logout", handlers.Auth.Logout).Methods(http.MethodPost, http.MethodOptions)

	protected.HandleFunc("/accounts", handlers.Account.CreateAccount).Methods(http.MethodPost, http.MethodOptions)
	protected.HandleFunc("/accounts", handlers.Account.GetAccounts).Methods(http.MethodGet, http.MethodOptions)
	protected.HandleFunc("/accounts/{id}", handlers.Account.UpdateAccount).Methods(http.MethodPatch, http.MethodOptions)
	protected.HandleFunc("/accounts/{id}/archive", handlers.Account.ArchiveAccount).Methods(http.MethodPatch, http.MethodOptions)

	protected.HandleFunc("/categories", handlers.Category.GetCategories).Methods(http.MethodGet, http.MethodOptions)
	protected.HandleFunc("/categories", handlers.Category.CreateCategory).Methods(http.MethodPost, http.MethodOptions)
	protected.HandleFunc("/categories/{id}", handlers.Category.UpdateCategory).Methods(http.MethodPatch, http.MethodOptions)

	protected.HandleFunc("/transactions", handlers.Transaction.CreateTransaction).Methods(http.MethodPost, http.MethodOptions)
	protected.HandleFunc("/transactions", handlers.Transaction.GetTransactions).Methods(http.MethodGet, http.MethodOptions)
	protected.HandleFunc("/transactions/{id}", handlers.Transaction.UpdateTransaction).Methods(http.MethodPatch, http.MethodOptions)
	protected.HandleFunc("/transactions/{id}", handlers.Transaction.DeleteTransaction).Methods(http.MethodDelete, http.MethodOptions)

	protected.HandleFunc("/budget/monthly", handlers.Budget.GetMonthlyBudget).Methods(http.MethodGet, http.MethodOptions)
	protected.HandleFunc("/budget/category-limit", handlers.Budget.SetCategoryLimit).Methods(http.MethodPost, http.MethodOptions)
	protected.HandleFunc("/budget/safe-daily-amount", handlers.Budget.GetSafeDailyAmount).Methods(http.MethodGet, http.MethodOptions)

	protected.HandleFunc("/dashboard", handlers.Dashboard.GetDashboard).Methods(http.MethodGet, http.MethodOptions)

	protected.HandleFunc("/analytics/categories", handlers.Analytics.GetCategoryStats).Methods(http.MethodGet, http.MethodOptions)
	protected.HandleFunc("/analytics/daily", handlers.Analytics.GetDailyStats).Methods(http.MethodGet, http.MethodOptions)
	protected.HandleFunc("/analytics/comparison", handlers.Analytics.GetIncomeExpenseComparison).Methods(http.MethodGet, http.MethodOptions)

	protected.HandleFunc("/recurring", handlers.Recurring.CreateRecurring).Methods(http.MethodPost, http.MethodOptions)
	protected.HandleFunc("/recurring", handlers.Recurring.GetRecurringPayments).Methods(http.MethodGet, http.MethodOptions)
	protected.HandleFunc("/recurring/generate", handlers.Recurring.GenerateTransactions).Methods(http.MethodPost, http.MethodOptions)

	protected.HandleFunc("/goals", handlers.Goal.CreateGoal).Methods(http.MethodPost, http.MethodOptions)
	protected.HandleFunc("/goals", handlers.Goal.GetGoals).Methods(http.MethodGet, http.MethodOptions)
	protected.HandleFunc("/goals/{id}/topup", handlers.Goal.TopupGoal).Methods(http.MethodPost, http.MethodOptions)

	protected.HandleFunc("/export/csv", handlers.Export.ExportCSV).Methods(http.MethodGet, http.MethodOptions)

	api.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	}).Methods(http.MethodGet)

	return r
}
