"use client";

import { useChat } from "@ai-sdk/react";

interface ChatInterfaceProps {
  onUploadComplete?: (fileId: number) => void;
}

export default function ChatInterface({ onUploadComplete }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error(err);
    },
  });

  return (
    <>
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap flex flex-col gap-2">
          <strong>{`${m.role}: `}</strong>
          {m.content}
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
    </>
  );
}