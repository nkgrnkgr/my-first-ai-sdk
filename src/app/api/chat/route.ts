import { openai } from "@ai-sdk/openai";
import { type CoreMessage, streamText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const body = await req.text();
    console.log("Request body:", body);

    if (!body) {
      throw new Error("Empty request body");
    }

    const { messages }: { messages: CoreMessage[] } = JSON.parse(body);

    const result = await streamText({
      model: openai.chat("gpt-4o"),
      messages,
      tools: {
        startRecording: tool({
          description:
            "ユーザーが音声録音を開始したい時に呼び出すツール。録音開始の指示を出します。",
          parameters: z.object({
            message: z
              .string()
              .describe("録音開始時にユーザーに表示するメッセージ"),
          }),
          execute: async ({ message }) => {
            return { success: true, message };
          },
        }),
        getTranscription: tool({
          description:
            "ユーザーが文字起こし結果を読みたい、確認したい、見たい時に呼び出すツール。音声ファイルIDを指定して文字起こし結果を取得します。",
          parameters: z.object({
            fileId: z
              .number()
              .describe("文字起こしを取得したい音声ファイルのID"),
          }),
          execute: async ({ fileId }) => {
            try {
              const response = await fetch('http://localhost:3000/api/get-transcription', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ fileId }),
              });
              
              if (response.ok) {
                const result = await response.json();
                return { 
                  success: true, 
                  fileId: result.fileId,
                  transcription: result.transcription,
                  status: result.status
                };
              } else {
                return { 
                  success: false, 
                  error: "文字起こし結果が見つかりませんでした" 
                };
              }
            } catch (error) {
              return { 
                success: false, 
                error: "文字起こし取得中にエラーが発生しました" 
              };
            }
          },
        }),
        listAudioFiles: tool({
          description:
            "ユーザーがアップロードした音声ファイルの一覧を取得したい時に呼び出すツール。ファイル一覧、最新の録音、すべての文字起こし状況を確認できます。",
          parameters: z.object({}),
          execute: async () => {
            try {
              const response = await fetch('http://localhost:3000/api/get-transcription', {
                method: 'GET',
              });
              
              if (response.ok) {
                const result = await response.json();
                return { 
                  success: true, 
                  files: result.transcriptions
                };
              } else {
                return { 
                  success: false, 
                  error: "ファイル一覧取得に失敗しました" 
                };
              }
            } catch (error) {
              return { 
                success: false, 
                error: "ファイル一覧取得中にエラーが発生しました" 
              };
            }
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in /api/chat:", error);
    // Even with the catch, we return a generic error to the client
    // for security reasons. The specific error is logged on the server.
    return new Response("An error occurred.", { status: 500 });
  }
}
