# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリでコードを扱う際のガイダンスを提供します。

## コマンド

- `pnpm dev` - Turbopack を使用した開発サーバーの起動
- `pnpm build` - 本番用アプリケーションのビルド
- `pnpm start` - 本番用サーバーの起動
- `pnpm check` - Biome リンターとフォーマッターの実行（自動修正付き）

## アーキテクチャ

チャット機能と音声録音・アップロード機能を統合した App Router を使用する Next.js 15 プロジェクトです。

**コア構造:**
- `src/app/page.tsx` - `@ai-sdk/react` を使用するメインチャットインターフェース
- `src/app/api/chat/route.ts` - AI レスポンスをストリーミングするための API エンドポイント
- `src/app/api/upload-audio/route.ts` - 音声ファイルアップロード用 API エンドポイント
- `src/components/AudioRecorder.tsx` - 音声録音・アップロード UI コンポーネント
- `lib/db.ts` - SQLite データベース設定と音声ファイル管理
- OpenAI GPT-4o モデルを使用したシンプルなチャット機能

**主要な依存関係:**
- `@ai-sdk/openai` と `ai` - OpenAI 統合のための AI SDK
- `@ai-sdk/react` - チャット機能のための React hooks
- `better-sqlite3` - SQLite データベース操作
- `multer` - ファイルアップロード処理

**音声録音機能:**
- ブラウザの MediaRecorder API を使用
- WebM 形式で録音データを取得
- 録音時間の表示とリアルタイム録音状態の表示
- 録音データの再生・削除・アップロード機能
- ファイルサイズ制限（10MB）と音声ファイル形式の検証

**環境設定:**
- `.env.local` に `OPENAI_API_KEY` が必要
- strict モードでの TypeScript 使用
- リンティング/フォーマッティングに Biome を使用（2スペース、ダブルクォート、セミコロン）
- スタイリングに Tailwind CSS を使用

**パスエイリアス:**
- `@/*` は `./src/*` にマップ