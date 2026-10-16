package main

import (
	"encoding/json"
	"log"
	"net/http"
	"os"
	"time"
)

type info struct {
	App      string `json:"app"`
	Version  string `json:"version"`
	Hostname string `json:"hostname"`
	Node     string `json:"node"`
	Time     string `json:"time"`
}

func getenv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func newMux() *http.ServeMux {
	mux := http.NewServeMux()

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		host, _ := os.Hostname()
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(info{
			App:      "devops-app",
			Version:  getenv("APP_VERSION", "dev"),
			Hostname: host,
			Node:     getenv("NODE_NAME", "desconhecido"),
			Time:     time.Now().Format(time.RFC3339),
		})
	})

	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("ok"))
	})

	return mux
}

func main() {
	port := getenv("PORT", "8080")
	log.Printf("devops-app ouvindo na porta %s", port)
	log.Fatal(http.ListenAndServe(":"+port, newMux()))
}
