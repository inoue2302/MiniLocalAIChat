# Mini Local AI Chat

ローカルLLMとIPFSを使った、クラウドに依存しないミニマルなAIチャットアプリケーション（実験・自由研究用）

## 目的

- クラウドに依存しないミニAIチャットを作る（実験・自由研究）
- ローカルLLMで応答し、会話ログをIPFSに保存・復元できることを確認する

## 機能

### 実装済み

- ✅ Web UIからメッセージ送信 → ローカルAPI → ローカルLLM応答表示
- ✅ 会話ログをメモリ内に保存（セッション管理）
- ✅ 会話ログをIPFSへ publish（HTTP API経由）してCIDを取得
- ✅ CIDコピーボタン（クリップボードにコピー）
- ✅ CIDから会話ログを fetch してUIに復元
- ✅ Markdown レンダリング（コードハイライト対応）
- ✅ Docker Compose で Ollama + IPFS を一括起動

### 非スコープ（今回やらない）

- ユーザー認証、マルチユーザー、権限管理
- 永続DB（PostgreSQLなど）
- ベクトル検索 / RAG
- 会話の暗号化、署名、アクセス制御（※将来検討）
- クラウドPinサービス前提の運用

## 技術スタック

### 動作環境

- **OS**: macOS / Windows / Linux（ローカル実行前提）
- **Node.js**: 20+（必須）
- **パッケージマネージャ**: pnpm 10.26.2+（推奨）
- **Docker**: Ollama と IPFS の実行に使用（推奨）

### 必須コンポーネント

#### Local LLM: Ollama

- Docker Compose で自動起動（推奨）
- モデルは軽量を推奨（例: phi3 / llama系）
- HTTP API（`http://localhost:11434`）経由で推論を呼び出し

#### IPFS: kubo

- Docker Compose で自動起動（推奨）
- HTTP API（`http://localhost:5001`）経由で会話ログを publish/fetch
- Gateway（`http://localhost:8080`）で CID にアクセス可能

### アプリ構成（モノレポ）

- **Web** (`apps/web`): Next.js 16 + React 19 + Tailwind CSS + shadcn/ui
  - react-markdown でコードハイライト対応
  - CID コピーボタン実装済み
- **API** (`apps/api`): Hono（Node.js サーバー）
  - `/chat` - Ollama との通信
  - `/sessions/:id/publish` - IPFS への publish
  - `/ipfs/:cid` - IPFS からの復元
- **会話ログ保存**: メモリ内（`Map<sessionId, Session>`）
- **IPFS連携**: HTTP API 経由（`http://localhost:5001/api/v0`）

## セットアップ

### 1. Docker で Ollama と IPFS を起動（推奨）

```bash
# Docker Compose で Ollama と IPFS を起動
docker compose up -d

# コンテナの起動確認
docker ps

# Ollama: モデルのダウンロード（初回のみ）
docker exec ollama ollama pull phi3

# Ollama: モデル一覧確認
docker exec ollama ollama list

# Ollama: HTTP API 疎通確認
curl http://127.0.0.1:11434/api/generate \
  -H "Content-Type: application/json" \
  -d '{"model":"phi3","prompt":"Hello","stream":false}'

# IPFS: デーモン起動確認
curl http://127.0.0.1:5001/api/v0/id -X POST
```

**次回以降の起動:**
```bash
# コンテナ起動
docker compose up -d

# コンテナ停止
docker compose down
```

**ローカルインストールを使う場合:**

Ollama:
```bash
# https://ollama.ai/ からインストール
ollama pull phi3
ollama list
```

IPFS:
```bash
# https://docs.ipfs.tech/install/command-line/ からインストール
ipfs init
ipfs daemon
```

### 2. アプリケーションのセットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd mini-local-ai-chat

# 依存関係のインストール（モノレポ全体）
pnpm install

# 開発サーバーの起動（API と Web を同時起動）
pnpm dev
```

`pnpm dev` で以下が同時起動されます：
- **API サーバー**: `http://localhost:3001` (apps/api)
- **Web UI**: `http://localhost:3000` (apps/web)

### 3. 動作確認

1. ブラウザで `http://localhost:3000` にアクセス
2. メッセージを入力して送信 → Ollama から応答が返る
3. 「Publish to IPFS」ボタンで会話を IPFS に保存
4. 表示された CID をコピーして別のセッションで復元可能

## API仕様

API サーバー: `http://localhost:3001`

### ヘルスチェック

```
GET /health
```

**Response:**
```json
{
  "ok": true
}
```

### チャット送信

```
POST /chat
```

**Request Body:**
```json
{
  "sessionId": "string (optional)",
  "message": "string (required)"
}
```

**Response:**
```json
{
  "reply": "string",
  "sessionId": "string"
}
```

### セッション取得

```
GET /sessions/:id
```

**Response:**
```json
{
  "sessionId": "string",
  "createdAt": "ISO 8601 string",
  "messages": [
    {
      "role": "user | assistant",
      "content": "string",
      "ts": "ISO 8601 string"
    }
  ]
}
```

### セッション公開（IPFS publish）

```
POST /sessions/:id/publish
```

**Response:**
```json
{
  "cid": "string"
}
```

## データ形式

### 会話ログ JSON

```json
{
  "sessionId": "string",
  "createdAt": "2025-12-28T10:00:00.000Z",
  "messages": [
    {
      "role": "user",
      "content": "こんにちは",
      "ts": "2025-12-28T10:00:00.000Z"
    },
    {
      "role": "assistant",
      "content": "こんにちは！何かお手伝いできることはありますか？",
      "ts": "2025-12-28T10:00:05.000Z"
    }
  ]
}
```

## エラーハンドリング

### Ollama未起動の場合

UIに分かりやすいエラーメッセージを表示:
```
エラー: Ollamaに接続できません。Ollamaが起動しているか確認してください。
```

### IPFS未起動の場合

publish/restore時に原因が分かるエラーを返す:
```
エラー: IPFSデーモンに接続できません。ipfs daemonが起動しているか確認してください。
```

## 開発コマンド

```bash
# 開発サーバー起動（API + Web を同時起動）
pnpm dev

# ビルド（全アプリをビルド）
pnpm build

# 本番環境起動（API + Web を同時起動）
pnpm start

# Lint（全アプリに対して実行）
pnpm lint

# ビルドファイルをクリア
pnpm clean:build

# node_modules を含めて全削除
pnpm clean
```

**個別のアプリケーションを操作する場合:**

```bash
# API のみ開発モードで起動
pnpm --filter api dev

# Web のみ開発モードで起動
pnpm --filter web dev

# API のみビルド
pnpm --filter api build
```

## ディレクトリ構成

```
mini-local-ai-chat/
├── apps/
│   ├── api/                    # Hono API サーバー
│   │   ├── src/
│   │   │   ├── index.ts        # メインサーバー + ルーティング
│   │   │   ├── session.ts      # セッション管理（メモリ内）
│   │   │   └── ipfs.ts         # IPFS HTTP API クライアント
│   │   └── package.json
│   └── web/                    # Next.js Web UI
│       ├── src/
│       │   ├── app/
│       │   │   ├── page.tsx    # メインページ（チャットUI）
│       │   │   └── layout.tsx  # レイアウト
│       │   ├── components/ui/  # shadcn/ui コンポーネント
│       │   └── lib/            # ユーティリティ
│       └── package.json
├── packages/                   # 共有パッケージ（将来用）
├── docker-compose.yml          # Ollama + IPFS 定義
├── pnpm-workspace.yaml         # モノレポ設定
├── package.json                # ルート package.json
└── README.md
```

## ライセンス

MIT

## 使用ポート一覧

| サービス | ポート | 用途 |
|---------|--------|------|
| Web UI | 3000 | Next.js フロントエンド |
| API サーバー | 3001 | Hono バックエンド |
| Ollama | 11434 | LLM HTTP API |
| IPFS API | 5001 | IPFS HTTP API |
| IPFS Gateway | 8080 | IPFS コンテンツ表示 |
| IPFS P2P | 4001 | IPFS ネットワーク通信 |

## 注意事項

- このアプリケーションは実験・学習目的で作成されています
- 本番環境での使用は想定していません
- セキュリティ機能（認証、暗号化など）は実装されていません
- ローカル環境でのみ動作します
- セッションデータはメモリ内にのみ保存されます（サーバー再起動で消失）

## 今後の検討事項

- セッションの永続化（現在はメモリ内のみ）
- 会話の暗号化
- デジタル署名による検証
- アクセス制御の実装
- ベクトル検索 / RAG機能
- マルチユーザー対応
- ストリーミングレスポンス対応

## 使用している主な技術・ライブラリ

### Frontend (apps/web)
- Next.js 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui (Button, Card, Input, Textarea)
- react-markdown + rehype-highlight (Markdown レンダリング)
- lucide-react (アイコン)

### Backend (apps/api)
- Hono (Web フレームワーク)
- Node.js 20+
- TypeScript
- @hono/node-server

### Infrastructure
- Docker Compose
- Ollama (LLM)
- IPFS Kubo (分散ストレージ)
