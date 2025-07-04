"use client";

import { useChat } from "@ai-sdk/react";
import AudioRecorder from "@/components/AudioRecorder";

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error(err);
    },
  });

  const handleUploadComplete = (fileId: number) => {
    console.log("音声ファイルがアップロードされました:", fileId);
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <AudioRecorder onUploadComplete={handleUploadComplete} />

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
    </div>
  );
}
