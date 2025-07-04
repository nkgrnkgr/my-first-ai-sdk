import { writeFile } from "node:fs/promises";
import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import { audioFileQueries } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("audio") as File;

    if (!file) {
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
    const filePath = path.join(process.cwd(), "uploads", filename);

    // ファイルの保存
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // データベースに記録
    const result = audioFileQueries.insert.run(
      filename,
      originalName,
      filePath,
      file.size,
      file.type
    );

    return NextResponse.json({
      success: true,
      fileId: result.lastInsertRowid,
      filename,
      originalName,
      fileSize: file.size,
      mimeType: file.type,
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
    const files = audioFileQueries.getAll.all();
    return NextResponse.json({ files });
  } catch (error) {
    console.error("音声ファイル取得エラー:", error);
    return NextResponse.json(
      { error: "ファイル取得に失敗しました" },
      { status: 500 }
    );
  }
}
