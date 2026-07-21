package yandex

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"

	"coinkeeper/internal/domain/service"
)

const (
	tokenURL = "https://oauth.yandex.ru/token"
	infoURL  = "https://login.yandex.ru/info"
)

type OAuthClient struct {
	clientID     string
	clientSecret string
	redirectURI  string
	httpClient   *http.Client
}

func NewOAuthClient(clientID, clientSecret, redirectURI string) service.OAuthService {
	return &OAuthClient{
		clientID:     clientID,
		clientSecret: clientSecret,
		redirectURI:  redirectURI,
		httpClient:   &http.Client{},
	}
}

func (c *OAuthClient) ExchangeCode(ctx context.Context, code string) (string, error) {
	data := url.Values{}
	data.Set("grant_type", "authorization_code")
	data.Set("code", code)
	data.Set("client_id", c.clientID)
	data.Set("client_secret", c.clientSecret)

	log.Printf("[yandex] exchanging code for client_id: %s, redirect_uri: %s", c.clientID, c.redirectURI)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, tokenURL, strings.NewReader(data.Encode()))
	if err != nil {
		return "", fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return "", fmt.Errorf("send request: %w", err)
	}
	defer resp.Body.Close()

	body, _ := io.ReadAll(resp.Body)
	log.Printf("[yandex] token response status: %d, body: %s", resp.StatusCode, string(body))

	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("unexpected status %d: %s", resp.StatusCode, string(body))
	}

	var tokenResp struct {
		AccessToken string `json:"access_token"`
		TokenType   string `json:"token_type"`
		ExpiresIn   int    `json:"expires_in"`
	}

	if err := json.Unmarshal(body, &tokenResp); err != nil {
		return "", fmt.Errorf("decode response: %w", err)
	}

	if tokenResp.AccessToken == "" {
		return "", fmt.Errorf("empty access token")
	}

	log.Printf("[yandex] successfully exchanged code for access token")
	return tokenResp.AccessToken, nil
}

func (c *OAuthClient) GetUserInfo(ctx context.Context, accessToken string) (*service.YandexUserInfo, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, infoURL, nil)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}
	req.Header.Set("Authorization", "OAuth "+accessToken)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("send request: %w", err)
	}
	defer resp.Body.Close()

	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("read body: %w", err)
	}

	log.Printf("[yandex] user info response status: %d, body: %s", resp.StatusCode, string(body))

	if resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("unexpected status %d: %s", resp.StatusCode, string(body))
	}

	var userInfo struct {
		ID              string `json:"id"`
		DefaultEmail    string `json:"default_email"`
		DisplayName     string `json:"display_name"`
		DefaultAvatarID string `json:"default_avatar_id"`
	}

	if err := json.Unmarshal(body, &userInfo); err != nil {
		return nil, fmt.Errorf("decode response: %w", err)
	}

	if userInfo.ID == "" {
		return nil, fmt.Errorf("empty user id")
	}

	avatarURL := ""
	if userInfo.DefaultAvatarID != "" {
		avatarURL = fmt.Sprintf("https://avatars.yandex.net/get-yapic/%s/islands-200", userInfo.DefaultAvatarID)
	}

	log.Printf("[yandex] successfully got user info: id=%s, email=%s", userInfo.ID, userInfo.DefaultEmail)

	return &service.YandexUserInfo{
		ID:        userInfo.ID,
		Email:     userInfo.DefaultEmail,
		Name:      userInfo.DisplayName,
		AvatarURL: avatarURL,
	}, nil
}
