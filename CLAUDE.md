# Mini Local AI Chat

ローカルLLM（Ollama）を使ったチャットアプリ。会話をIPFSに保存・共有できる。

## 技術スタック

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **Backend**: Hono (Node.js)
- **Infrastructure**: Ollama (LLM), Kubo (IPFS), Docker Compose

## 構造

- `apps/web/` - Next.jsフロントエンド
- `apps/api/` - Hono APIサーバー

## 開発コマンド

- `pnpm dev` - 開発サーバー起動（Web + API）
- `pnpm build` - ビルド
- `docker compose up -d` - Ollama + IPFS起動

## ポート

- Web: 3000
- API: 3001
- Ollama: 11434
- IPFS Gateway: 8080
- IPFS API: 5001
