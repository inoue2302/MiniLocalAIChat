# Mini Local AI Chat

ローカルLLMとIPFSを使った、クラウドに依存しないミニマルなAIチャットアプリケーション（実験・自由研究用）

## 目的

- クラウドに依存しないミニAIチャットを作る（実験・自由研究）
- ローカルLLMで応答し、会話ログをIPFSに保存・復元できることを確認する

## 機能

### スコープ（ミニマム）

- Web UIからメッセージ送信 → ローカルAPI → ローカルLLM応答表示
- 会話ログをJSONとしてローカル保存
- 会話ログをIPFSへ publish（`ipfs add`）してCIDを取得
- CIDから会話ログを fetch（`ipfs cat`）してUIに復元

### 非スコープ（今回やらない）

- ユーザー認証、マルチユーザー、権限管理
- 永続DB（PostgreSQLなど）
- ベクトル検索 / RAG
- 会話の暗号化、署名、アクセス制御（※将来検討）
- クラウドPinサービス前提の運用

## 技術スタック

### 動作環境

- **OS**: macOS / Windows / Linux（ローカル実行前提）
- **Node.js**: 20+（推奨）
- **パッケージマネージャ**: pnpm（推奨） or npm

### 必須コンポーネント

#### Local LLM: Ollama

- モデルは軽量を推奨（例: phi / llama系）
- API経由で推論を呼び出せること

#### IPFS: kubo（ローカルdaemon）

- `ipfs daemon` が起動していること
- `ipfs add` / `ipfs cat` がCLIで動作すること

### アプリ構成

- **Web**: Next.js（UI）
- **API**: Hono（またはNext Route Handlerでも可）
- **会話ログ保存**: ファイルJSON（例: `./data/sessions/<sessionId>.json`）
- **IPFS連携**: サーバー側からCLI実行 or HTTP API

## セットアップ

### 1. 前提条件の確認

#### Ollamaのインストールと起動

```bash
# Ollamaのインストール（公式サイトから）
# https://ollama.ai/

# モデルのダウンロード（例: phi）
ollama pull phi

# Ollama起動確認
ollama list
```

#### IPFSのインストールと起動

```bash
# kuboのインストール（公式サイトから）
# https://docs.ipfs.tech/install/command-line/

# IPFSの初期化（初回のみ）
ipfs init

# IPFSデーモンの起動
ipfs daemon

# 別ターミナルで動作確認
ipfs id
```

### 2. アプリケーションのセットアップ

```bash
# リポジトリのクローン
git clone <repository-url>
cd mini-local-ai-chat

# 依存関係のインストール
pnpm install
# または
npm install

# 開発サーバーの起動
pnpm dev
# または
npm run dev
```

### 3. 動作確認

ブラウザで `http://localhost:3000` にアクセス

## API仕様

### チャット送信

```
POST /chat
```

**Request Body:**
```json
{
  "sessionId": "string",
  "message": "string"
}
```

**Response:**
```json
{
  "reply": "string"
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

### IPFS復元

```
GET /ipfs/:cid
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
# 開発サーバー起動
pnpm dev

# ビルド
pnpm build

# 本番環境起動
pnpm start

# Lint
pnpm lint

# テスト
pnpm test
```

## ディレクトリ構成

```
mini-local-ai-chat/
├── src/
│   ├── app/          # Next.js pages
│   ├── components/   # React components
│   ├── lib/          # Utility functions
│   └── api/          # API handlers (Hono or Route Handlers)
├── data/
│   └── sessions/     # Session JSON files
├── public/           # Static files
└── README.md
```

## ライセンス

MIT

## 注意事項

- このアプリケーションは実験・学習目的で作成されています
- 本番環境での使用は想定していません
- セキュリティ機能（認証、暗号化など）は実装されていません
- ローカル環境でのみ動作します

## 今後の検討事項

- 会話の暗号化
- デジタル署名による検証
- アクセス制御の実装
- ベクトル検索 / RAG機能
- マルチユーザー対応
