import { NextRequest, NextResponse } from "next/server";
import { audioFileQueries } from "../../../../lib/db";

export async function POST(req: NextRequest) {
  try {
    const { fileId } = await req.json();
    
    if (!fileId) {
      return NextResponse.json({ error: "fileId is required" }, { status: 400 });
    }

    console.log("文字起こし処理開始 - fileId:", fileId);

    // 3つの文字起こし結果からランダムに選択
    const transcriptions = ["こんにちは", "ごきげんよう", "Hello"];
    const randomTranscription = transcriptions[Math.floor(Math.random() * transcriptions.length)];
    
    console.log("選択された文字起こし:", randomTranscription);
    
    // DBの文字起こし結果を更新
    try {
      const updateResult = audioFileQueries.updateTranscription.run(randomTranscription, "completed", fileId);
      console.log("DB更新結果:", updateResult);
    } catch (dbError) {
      console.error("DB更新エラー:", dbError);
      throw dbError;
    }
    
    return NextResponse.json({ 
      fileId,
      transcription: randomTranscription,
      status: "completed"
    });
  } catch (error) {
    console.error("Transcription error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}