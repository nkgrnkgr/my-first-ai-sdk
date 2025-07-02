"use client";

import { useChat } from "@ai-sdk/react";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error(err);
    },
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap flex flex-col gap-2">
          <strong>{`${m.role}: `}</strong>
          {m.content}

          {m.parts?.map((part) => {
            if (
              part.type === "tool-invocation" &&
              part.toolInvocation.toolName === "showImage"
            ) {
              const { url, alt } = part.toolInvocation.args as {
                url: string;
                alt: string;
              };
              return (
                <div
                  key={part.toolInvocation.toolCallId}
                  className="flex flex-col gap-2"
                >
                  <p>Here is the image you requested:</p>
                  {/** biome-ignore lint/performance/noImgElement: <explanation> */}
                  <img src={url} alt={alt} className="rounded-lg" />
                </div>
              );
            }

            if (
              part.type === "tool-invocation" &&
              part.toolInvocation.toolName === "nabeatsu"
            ) {
              const { hiragana } = part.toolInvocation.args as {
                hiragana: string;
              };
              return (
                <div
                  key={part.toolInvocation.toolCallId}
                  className="p-4 bg-blue-100 border-2 border-blue-300 rounded-lg"
                >
                  <p className="text-2xl font-bold text-blue-800">{hiragana}</p>
                </div>
              );
            }
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}
