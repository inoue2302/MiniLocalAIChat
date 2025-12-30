# AGENTS.md

このリポジトリでAIエージェントが作業するための共通ルールです。

## リポジトリ概要

- **mini-local-ai-chat**: ローカルLLM(Ollama)とIPFS(kubo)で動くミニAIチャット（実験/学習用）
- モノレポ: `pnpm` workspace
  - `apps/api`: Hono + Node（ポート `3001`）
  - `apps/web`: Next.js（ポート `3000`）

## ローカル依存(起動前提)

- Ollama: `http://localhost:11434`
- IPFS API: `http://localhost:5001`
- IPFS Gateway: `http://localhost:8080`
- `docker compose up -d` で `ollama` / `ipfs` を起動可能

## 基本コマンド

- 依存導入: `pnpm install`
- 開発起動: `pnpm dev`
- ビルド: `pnpm build`
- Lint: `pnpm lint`
- 個別起動:
  - API: `pnpm --filter api dev`
  - Web: `pnpm --filter web dev`

## 実装ルール

- 目的に反する機能追加（認証/DB/RAG/暗号化など）は、明示的な依頼がない限り行わない
- 変更は最小限・局所的に行い、不要なリネームや大規模整形を避ける
- 依存追加は慎重に（標準API/既存依存で実現できるかを先に検討）
- TypeScriptで型を崩さない（`any` の安易な導入を避ける）
- エラーハンドリングは原因が分かる内容にする（特に Ollama / IPFS の未起動・疎通失敗）

## ファイル配置の注意

- セッション保存は `apps/api/src/session.ts` で `__dirname` 基準のパスを使用している
  - ビルド後（`dist/` 実行）も想定し、パス設計を壊さない

## 変更の検証

- 可能なら `pnpm dev` で動作確認し、最低限 `/health` や `/chat` の疎通を確認する
- 既存の外部I/F（`/chat`, `/sessions/:id`, `/sessions/:id/publish`）を破壊しない

