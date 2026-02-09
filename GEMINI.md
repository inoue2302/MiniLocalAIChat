# GEMINI.md (for mini-local-ai-chat)

このファイルは、Google Gemini などのAIがこのリポジトリで作業する際のガイドです。

## 目的と前提

- ローカルLLM(Ollama)で応答し、会話ログをIPFSへ publish / CIDから復元できることを検証する
- 学習/実験用途のため、セキュリティ機能（認証・暗号化等）は現状スコープ外

## 主要ディレクトリ

- `apps/web`: Next.js UI（ユーザー入力、表示、CIDのコピー/ロード）
- `apps/api`: Hono API（Ollama呼び出し、セッション保存、IPFS publish）

## エンドポイントと依存サービス

- Web → API: `http://localhost:3001`
  - `POST /chat`
  - `GET /sessions/:id`
  - `POST /sessions/:id/publish`
- API → Ollama: `http://localhost:11434/api/generate`
- API → IPFS HTTP API: `http://localhost:5001/api/v0/add`
- Web → IPFS Gateway: `http://localhost:8080/ipfs/:cid`

## 開発の流れ

```bash
pnpm install
docker compose up -d   # 必要に応じて（ollama/ipfs）
pnpm dev
```

## 作業指針

- 変更は小さく、既存の最小構成を維持する
- 追加依存は最小限（導入が必要なら、理由・代替案・影響範囲を明記）
- ブラウザ実行コード（`apps/web`）とNode実行コード（`apps/api`）を混同しない
- エラーはユーザーが復旧できる文言にする（例: 「Ollamaが起動していない」「IPFSが起動していない」）

