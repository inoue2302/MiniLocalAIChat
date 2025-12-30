# CLAUDE.md (for mini-local-ai-chat)

このファイルは、Anthropic Claude などのAIがこのリポジトリで作業する際のガイドです。

## プロジェクト概要

- 目的: **ローカルLLM(Ollama)** と **IPFS(kubo)** を使い、クラウド依存なしのミニマルなAIチャットを検証する
- 前提: 学習/実験用途（認証・暗号化・マルチユーザー等は非スコープ）

## 構成

- `apps/web`: Next.js (App Router) のUI
- `apps/api`: Hono + Node サーバー（WebからのAPI呼び出し受け口）
- データ: `apps/api/data/sessions/*.json` にセッションを保存（`dist/`配下で動く前提のパス設計に注意）

## 外部サービス(ローカル)

- Ollama: `http://localhost:11434`（`/api/generate` を使用、モデル例 `phi3`）
- IPFS(kubo): HTTP API `http://localhost:5001`（`/api/v0/add`）、Gateway `http://localhost:8080`
- `docker-compose.yml` で `ollama` と `ipfs` を起動できる

## 開発コマンド

```bash
pnpm install
pnpm dev         # web(3000) と api(3001) を同時起動
pnpm lint        # web のみ（現状）
pnpm build
pnpm start
```

## 作業方針（重要）

- 変更は最小限にし、既存の設計（ローカル前提・ミニマム）を崩さない
- 可能なら **追加依存は増やさない**（増やす場合は理由・代替案・影響範囲を明記）
- TypeScriptの型安全性を優先し、`any` の増殖を避ける
- エラー時は「どこが起動していない/疎通できないか」が分かるメッセージにする（Ollama/IPFS）
- UIとAPIの境界を意識する（`apps/web` はブラウザ実行、`apps/api` はNode実行）

## よくある落とし穴

- `apps/api/src/session.ts` の保存先は `__dirname` 基準（ビルド後は `apps/api/dist` になる）
- ブラウザからのCORS・ローカルポート固定（現状 `web -> http://localhost:3001`）
- IPFSは Gateway(8080) と API(5001) の用途が異なる

## 変更時のチェックリスト

- 目的（ローカル最小構成）に合っているか
- `pnpm dev` で起動できるか
- 既存のAPIエンドポイントのI/Fを壊していないか
- エラーメッセージが利用者に分かるか

