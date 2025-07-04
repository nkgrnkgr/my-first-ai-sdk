// biome-ignore assist/source/organizeImports: <explanation>
import { type NextRequest, NextResponse } from "next/server";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { audioFileQueries } from "../../../../lib/db";

export async function POST(request: NextRequest) {
  try {
    console.log("音声アップロード開始");
    const formData = await request.formData();
    const file = formData.get("audio") as File;

    console.log("受信したファイル情報:", {
      name: file?.name,
      size: file?.size,
      type: file?.type,
    });

    if (!file) {
      console.log("ファイルが見つかりません");
      return NextResponse.json(
        { error: "音声ファイルが見つかりません" },
        { status: 400 }
      );
    }

    // ファイルの検証
    if (!file.type.startsWith("audio/")) {
      return NextResponse.json(
        { error: "音声ファイルのみアップロード可能です" },
        { status: 400 }
      );
    }

    // ファイルサイズ制限（10MB）
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "ファイルサイズが10MBを超えています" },
        { status: 400 }
      );
    }

    // ファイル名の生成
    const timestamp = Date.now();
    const originalName = file.name || "audio_recording";
    const fileExtension = path.extname(originalName) || ".webm";
    const filename = `${timestamp}${fileExtension}`;
    const uploadsDir = path.join(process.cwd(), "uploads");
    const filePath = path.join(uploadsDir, filename);

    // uploadsディレクトリが存在しない場合は作成
    try {
      await mkdir(uploadsDir, { recursive: true });
    } catch (error) {
      console.log("uploadsディレクトリは既に存在します");
    }

    // ファイルの保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // データベースに記録
    console.log("データベースに記録開始");
    const result = audioFileQueries.insert.run(
      filename,
      originalName,
      filePath,
      file.size,
      file.type
    );
    console.log("データベース記録完了:", result.lastInsertRowid);

    const fileId = result.lastInsertRowid as number;

    // アップロード時にすぐ文字起こしを完了状態にする
    const transcriptions = ["こんにちは", "ごきげんよう", "Hello"];
    const randomTranscription = transcriptions[Math.floor(Math.random() * transcriptions.length)];
    
    console.log(`ファイルID ${fileId} の文字起こしを即座に完了: ${randomTranscription}`);
    
    // DBの文字起こし結果を更新
    try {
      const updateResult = audioFileQueries.updateTranscription.run(randomTranscription, "completed", fileId);
      console.log("文字起こしDB更新結果:", updateResult);
    } catch (dbError) {
      console.error("文字起こしDB更新エラー:", dbError);
    }

    return NextResponse.json({
      success: true,
      fileId,
      filename,
      originalName,
      fileSize: file.size,
      mimeType: file.type,
      transcription: randomTranscription, // 文字起こし結果も返す
    });
  } catch (error) {
    console.error("音声アップロードエラー:", error);
    return NextResponse.json(
      { error: "アップロードに失敗しました" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    console.log("GET /api/upload-audio が呼ばれました");
    const files = audioFileQueries.getAll.all();
    return NextResponse.json({
      message: "API endpoint is working",
      files,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("音声ファイル取得エラー:", error);
    return NextResponse.json(
      { error: "ファイル取得に失敗しました" },
      { status: 500 }
    );
  }
}
