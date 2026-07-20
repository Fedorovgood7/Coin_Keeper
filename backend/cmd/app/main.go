package main

import (
	"context"
	"database/sql"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"coinkeeper/internal/application/usecase/account"
	"coinkeeper/internal/application/usecase/analytics"
	"coinkeeper/internal/application/usecase/auth"
	"coinkeeper/internal/application/usecase/budget"
	"coinkeeper/internal/application/usecase/category"
	"coinkeeper/internal/application/usecase/dashboard"
	"coinkeeper/internal/application/usecase/export"
	"coinkeeper/internal/application/usecase/goal"
	"coinkeeper/internal/application/usecase/recurring"
	"coinkeeper/internal/application/usecase/transaction"
	"coinkeeper/internal/infrastructure/config"
	"coinkeeper/internal/infrastructure/postgres"
	"coinkeeper/internal/infrastructure/session"
	"coinkeeper/internal/infrastructure/yandex"
	presentation "coinkeeper/internal/presentation/http"
	"coinkeeper/internal/presentation/http/handler"

	"github.com/golang-migrate/migrate/v4"
	_ "github.com/golang-migrate/migrate/v4/database/postgres"
	_ "github.com/golang-migrate/migrate/v4/source/file"
	_ "github.com/lib/pq"
)

func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("Failed to load config: %v", err)
	}

	db, err := sql.Open("postgres", cfg.Database.DSN())
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	db.SetMaxOpenConns(25)
	db.SetMaxIdleConns(25)
	db.SetConnMaxLifetime(5 * time.Minute)

	if err := db.Ping(); err != nil {
		log.Fatalf("Failed to ping database: %v", err)
	}

	log.Println("Connected to database")

	m, err := migrate.New("file://migrations", cfg.Database.URL())
	if err != nil {
		log.Fatalf("Failed to create migrator: %v", err)
	}
	if err := m.Up(); err != nil && err != migrate.ErrNoChange {
		log.Fatalf("Failed to run migrations: %v", err)
	}
	log.Println("Migrations completed")

	userRepo := postgres.NewUserRepository(db)
	accountRepo := postgres.NewAccountRepository(db)
	categoryRepo := postgres.NewCategoryRepository(db)
	transactionRepo := postgres.NewTransactionRepository(db)
	budgetRepo := postgres.NewBudgetRepository(db)
	goalRepo := postgres.NewGoalRepository(db)
	recurringRepo := postgres.NewRecurringRepository(db)

	oauthService := yandex.NewOAuthClient(cfg.Yandex.ClientID, cfg.Yandex.ClientSecret, cfg.Yandex.RedirectURI)
	sessionService := session.NewJWTService(cfg.JWT.SecretKey, cfg.JWT.TokenDuration)

	loginWithYandexUC := auth.NewLoginWithYandexUseCase(userRepo, oauthService, sessionService)
	getProfileUC := auth.NewGetProfileUseCase(userRepo)

	createAccountUC := account.NewCreateAccountUseCase(accountRepo)
	getAccountsUC := account.NewGetAccountsUseCase(accountRepo)
	updateAccountUC := account.NewUpdateAccountUseCase(accountRepo)
	archiveAccountUC := account.NewArchiveAccountUseCase(accountRepo)

	getCategoriesUC := category.NewGetCategoriesUseCase(categoryRepo)
	createCategoryUC := category.NewCreateCategoryUseCase(categoryRepo)
	updateCategoryUC := category.NewUpdateCategoryUseCase(categoryRepo)

	createTransactionUC := transaction.NewCreateTransactionUseCase(transactionRepo, accountRepo, budgetRepo)
	getTransactionsUC := transaction.NewGetTransactionsUseCase(transactionRepo)
	updateTransactionUC := transaction.NewUpdateTransactionUseCase(transactionRepo, accountRepo)
	deleteTransactionUC := transaction.NewDeleteTransactionUseCase(transactionRepo, accountRepo)

	getMonthlyBudgetUC := budget.NewGetMonthlyBudgetUseCase(budgetRepo, transactionRepo)
	setCategoryLimitUC := budget.NewSetCategoryLimitUseCase(budgetRepo)
	calculateSafeDailyAmountUC := budget.NewCalculateSafeDailyAmountUseCase(budgetRepo)

	getDashboardDataUC := dashboard.NewGetDashboardDataUseCase(accountRepo, transactionRepo, budgetRepo, recurringRepo, categoryRepo)

	getCategoryStatsUC := analytics.NewGetCategoryStatsUseCase(transactionRepo, categoryRepo)
	getDailyStatsUC := analytics.NewGetDailyStatsUseCase(transactionRepo)
	getIncomeExpenseComparisonUC := analytics.NewGetIncomeExpenseComparisonUseCase(transactionRepo)

	createRecurringUC := recurring.NewCreateRecurringUseCase(recurringRepo)
	getRecurringPaymentsUC := recurring.NewGetRecurringPaymentsUseCase(recurringRepo)
	generateTransactionsUC := recurring.NewGenerateTransactionsUseCase(recurringRepo, transactionRepo, accountRepo)

	createGoalUC := goal.NewCreateGoalUseCase(goalRepo)
	getGoalsUC := goal.NewGetGoalsUseCase(goalRepo)
	topupGoalUC := goal.NewTopupGoalUseCase(goalRepo, accountRepo)

	exportTransactionsCSVUC := export.NewExportTransactionsCSVUseCase(transactionRepo)

	handlers := &presentation.Handlers{
		Auth:        handler.NewAuthHandler(loginWithYandexUC, getProfileUC),
		Account:     handler.NewAccountHandler(createAccountUC, getAccountsUC, updateAccountUC, archiveAccountUC),
		Category:    handler.NewCategoryHandler(getCategoriesUC, createCategoryUC, updateCategoryUC),
		Transaction: handler.NewTransactionHandler(createTransactionUC, getTransactionsUC, updateTransactionUC, deleteTransactionUC),
		Budget:      handler.NewBudgetHandler(getMonthlyBudgetUC, setCategoryLimitUC, calculateSafeDailyAmountUC),
		Dashboard:   handler.NewDashboardHandler(getDashboardDataUC),
		Analytics:   handler.NewAnalyticsHandler(getCategoryStatsUC, getDailyStatsUC, getIncomeExpenseComparisonUC),
		Recurring:   handler.NewRecurringHandler(createRecurringUC, getRecurringPaymentsUC, generateTransactionsUC),
		Goal:        handler.NewGoalHandler(createGoalUC, getGoalsUC, topupGoalUC),
		Export:      handler.NewExportHandler(exportTransactionsCSVUC),
	}

	router := presentation.NewRouter(sessionService, handlers)

	addr := fmt.Sprintf("%s:%s", cfg.Server.Host, cfg.Server.Port)
	srv := &http.Server{
		Addr:         addr,
		Handler:      router,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Printf("Server starting on %s", addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatalf("Server forced to shutdown: %v", err)
	}

	log.Println("Server stopped")
}
