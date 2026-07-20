package config

import (
	"fmt"
	"os"
	"strconv"
	"time"
)

type Config struct {
	Server   ServerConfig
	Database DatabaseConfig
	JWT      JWTConfig
	Yandex   YandexConfig
}

type ServerConfig struct {
	Port string
	Host string
}

type DatabaseConfig struct {
	Host     string
	Port     string
	User     string
	Password string
	DBName   string
	SSLMode  string
}

type JWTConfig struct {
	SecretKey     string
	TokenDuration time.Duration
}

type YandexConfig struct {
	ClientID     string
	ClientSecret string
	RedirectURI  string
}

func Load() (*Config, error) {
	tokenDurationHours := getEnvAsInt("JWT_TOKEN_DURATION_HOURS", 24)

	config := &Config{
		Server: ServerConfig{
			Port: getEnv("SERVER_PORT", "8080"),
			Host: getEnv("SERVER_HOST", "0.0.0.0"),
		},
		Database: DatabaseConfig{
			Host:     getEnv("DB_HOST", "localhost"),
			Port:     getEnv("DB_PORT", "5432"),
			User:     getEnv("DB_USER", "postgres"),
			Password: getEnv("DB_PASSWORD", "postgres"),
			DBName:   getEnv("DB_NAME", "coinkeeper"),
			SSLMode:  getEnv("DB_SSLMODE", "disable"),
		},
		JWT: JWTConfig{
			SecretKey:     getEnv("JWT_SECRET", "your-secret-key-change-in-production"),
			TokenDuration: time.Duration(tokenDurationHours) * time.Hour,
		},
		Yandex: YandexConfig{
			ClientID:     os.Getenv("YANDEX_CLIENT_ID"),
			ClientSecret: os.Getenv("YANDEX_CLIENT_SECRET"),
			RedirectURI:  os.Getenv("YANDEX_REDIRECT_URI"),
		},
	}

	if err := config.validate(); err != nil {
		return nil, err
	}

	return config, nil
}

func (c *DatabaseConfig) DSN() string {
	return fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		c.Host, c.Port, c.User, c.Password, c.DBName, c.SSLMode,
	)
}

func (c *DatabaseConfig) URL() string {
	return fmt.Sprintf(
		"postgres://%s:%s@%s:%s/%s?sslmode=%s",
		c.User, c.Password, c.Host, c.Port, c.DBName, c.SSLMode,
	)
}

func (c *Config) validate() error {
	if c.Yandex.ClientID == "" {
		return fmt.Errorf("YANDEX_CLIENT_ID is required")
	}
	if c.Yandex.ClientSecret == "" {
		return fmt.Errorf("YANDEX_CLIENT_SECRET is required")
	}
	if c.Yandex.RedirectURI == "" {
		return fmt.Errorf("YANDEX_REDIRECT_URI is required")
	}
	return nil
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getEnvAsInt(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intVal, err := strconv.Atoi(value); err == nil {
			return intVal
		}
	}
	return defaultValue
}
