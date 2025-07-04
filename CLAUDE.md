# CLAUDE.md

このファイルは Claude Code (claude.ai/code) がこのリポジトリでコードを扱う際のガイダンスを提供します。

## コマンド

- `pnpm dev` - Turbopack を使用した開発サーバーの起動
- `pnpm build` - 本番用アプリケーションのビルド
- `pnpm start` - 本番用サーバーの起動
- `pnpm check` - Biome リンターとフォーマッターの実行（自動修正付き）

## アーキテクチャ

チャット機能のために AI SDK を統合した App Router を使用する Next.js 15 プロジェクトです。

**コア構造:**
- `src/app/page.tsx` - `@ai-sdk/react` を使用するメインチャットインターフェース
- `src/app/api/chat/route.ts` - AI レスポンスをストリーミングするための API エンドポイント
- カスタムツール（showImage、nabeatsu）を含む OpenAI GPT-4o モデルを使用

**主要な依存関係:**
- `@ai-sdk/openai` と `ai` - OpenAI 統合のための AI SDK
- `@ai-sdk/react` - チャット機能のための React hooks
- `zod` - ツールパラメータのスキーマ検証

**ツール実装:**
- `showImage` - URL と alt テキストを使用してチャットに画像を表示
- `nabeatsu` - 3の倍数のひらがな読みを表示する特別なツール

**環境設定:**
- `.env.local` に `OPENAI_API_KEY` が必要
- strict モードでの TypeScript 使用
- リンティング/フォーマッティングに Biome を使用（2スペース、ダブルクォート、セミコロン）
- スタイリングに Tailwind CSS を使用

**パスエイリアス:**
- `@/*` は `./src/*` にマップ