package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestHealth(t *testing.T) {
	rec := httptest.NewRecorder()
	newMux().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/health", nil))

	if rec.Code != http.StatusOK || rec.Body.String() != "ok" {
		t.Fatalf("esperado 200/ok, recebido %d/%q", rec.Code, rec.Body.String())
	}
}

func TestRoot(t *testing.T) {
	t.Setenv("APP_VERSION", "abc123")
	rec := httptest.NewRecorder()
	newMux().ServeHTTP(rec, httptest.NewRequest(http.MethodGet, "/", nil))

	var got info
	if err := json.Unmarshal(rec.Body.Bytes(), &got); err != nil {
		t.Fatalf("resposta nao e JSON: %v", err)
	}
	if got.Version != "abc123" {
		t.Fatalf("versao esperada abc123, recebida %q", got.Version)
	}
}
