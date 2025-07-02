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
        showImage: tool({
          description: "A tool to show an image to the user.",
          parameters: z.object({
            url: z.string().describe("The URL of the image to show."),
            alt: z.string().describe("The alternative text for the image."),
          }),
        }),
        nabeatsu: tool({
          description:
            "When you are given a number, if it is a multiple of 3, you must call this tool. The tool will then render the hiragana reading of the number.",
          parameters: z.object({
            hiragana: z
              .string()
              .describe(
                "The hiragana reading of the number that is a multiple of 3."
              ),
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
