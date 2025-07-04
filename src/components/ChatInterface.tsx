"use client";

import { useChat } from "@ai-sdk/react";
import { useEffect } from "react";

interface ChatInterfaceProps {
  onUploadComplete?: (fileId: number) => void;
  onStartRecording?: () => void;
  onStopRecording?: () => void;
}

export default function ChatInterface({ onUploadComplete, onStartRecording, onStopRecording }: ChatInterfaceProps) {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error(err);
    },
  });

  // tool callingの結果を監視して録音制御
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      
      // assistantのメッセージでtool invocationがある場合
      if (lastMessage.role === 'assistant' && lastMessage.parts) {
        lastMessage.parts.forEach((part) => {
          if (part.type === 'tool-invocation') {
            const toolName = part.toolInvocation.toolName;
            const args = part.toolInvocation.args;
            
            console.log(`Tool called: ${toolName}`, args);
            
            if (toolName === 'startRecording') {
              console.log('GPTから録音開始指示を受信:', args);
              onStartRecording?.();
            } else if (toolName === 'stopRecording') {
              console.log('GPTから録音停止指示を受信:', args);
              onStopRecording?.();
            }
          }
        });
      }
    }
  }, [messages, onStartRecording, onStopRecording]);

  return (
    <>
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap flex flex-col gap-2">
          <strong>{`${m.role}: `}</strong>
          {m.content}
          
          {/* Tool invocationの結果を表示 */}
          {m.parts?.map((part) => {
            if (part.type === "tool-invocation") {
              const { toolName, args } = part.toolInvocation;
              
              if (toolName === "startRecording") {
                return (
                  <div
                    key={part.toolInvocation.toolCallId}
                    className="p-3 bg-red-50 border-l-4 border-red-400 rounded"
                  >
                    <p className="text-red-800 font-semibold">🎤 録音開始</p>
                    <p className="text-red-600">{args.message}</p>
                  </div>
                );
              }
              
              if (toolName === "stopRecording") {
                return (
                  <div
                    key={part.toolInvocation.toolCallId}
                    className="p-3 bg-gray-50 border-l-4 border-gray-400 rounded"
                  >
                    <p className="text-gray-800 font-semibold">⏹️ 録音停止</p>
                    <p className="text-gray-600">{args.message}</p>
                  </div>
                );
              }
            }
          })}
        </div>
      ))}

      <form onSubmit={handleSubmit}>
        <input
          className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl bg-white"
          value={input}
          placeholder="Say something..."
          onChange={handleInputChange}
        />
      </form>
    </>
  );
}