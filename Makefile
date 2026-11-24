.PHONY: dev

# Starts Postgres (detached), then streams web (:3000) + api (:4000) logs together.
# Ctrl+C stops both apps; Postgres keeps running (`docker compose stop` to stop it).
dev:
	docker compose up -d postgres
	pnpm exec turbo run dev --ui=stream
