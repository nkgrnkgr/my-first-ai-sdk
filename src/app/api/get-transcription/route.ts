import { NextRequest, NextResponse } from "next/server";
import { audioFileQueries } from "../../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const { fileId } = await req.json();
    
    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    console.log("文字起こし取得要求 - fileId:", fileId);

    // DBから文字起こし結果を取得
    const result = audioFileQueries.getTranscriptionById.get(fileId) as any;
    
    console.log("DB検索結果:", result);
    
    if (!result) {
      // デバッグ用：全ファイルを表示
      const allFiles = audioFileQueries.getAll.all() as any[];
      console.log("利用可能なファイル一覧:", allFiles.map(f => ({ id: f.id, filename: f.filename })));
      return NextResponse.json({ error: "Audio file not found" }, { status: 404 });
    }

    return NextResponse.json({
      fileId: result.id,
      transcription: result.transcription || null,
      status: result.transcription_status,
      createdAt: result.created_at
    });
  } catch (error) {
    console.error("Get transcription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    // 全ての音声ファイルの文字起こし状況を取得
    const results = audioFileQueries.getAll.all() as any[];
    
    const transcriptions = results.map(result => ({
      fileId: result.id,
      filename: result.original_name,
      transcription: result.transcription || null,
      status: result.transcription_status,
      createdAt: result.created_at
    }));

    return NextResponse.json({ transcriptions });
  } catch (error) {
    console.error("Get all transcriptions error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}