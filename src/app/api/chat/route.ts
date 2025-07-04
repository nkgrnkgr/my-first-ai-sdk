import { openai } from "@ai-sdk/openai";
import { type CoreMessage, streamText, tool } from "ai";
import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();

    const result = await streamText({
      model: openai.chat("gpt-4o"),
      messages,
      tools: {
        startRecording: tool({
          description: "ユーザーが音声録音を開始したい時に呼び出すツール。録音開始の指示を出します。",
          parameters: z.object({
            message: z.string().describe("録音開始時にユーザーに表示するメッセージ"),
          }),
        }),
        stopRecording: tool({
          description: "音声録音を停止したい時に呼び出すツール。録音停止の指示を出します。",
          parameters: z.object({
            message: z.string().describe("録音停止時にユーザーに表示するメッセージ"),
          }),
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
