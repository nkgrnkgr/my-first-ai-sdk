import { openai } from "@ai-sdk/openai";
import { type CoreMessage, streamText } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const { messages }: { messages: CoreMessage[] } = await req.json();

    const result = await streamText({
      model: openai.chat("gpt-4o"),
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error("Error in /api/chat:", error);
    // Even with the catch, we return a generic error to the client
    // for security reasons. The specific error is logged on the server.
    return new Response("An error occurred.", { status: 500 });
  }
}
