"use client";

import { useChat } from "@ai-sdk/react";
import { useCallback, useEffect, useRef, useState } from "react";

interface ChatInterfaceProps {
  onRecordingRequest?: () => Promise<void>;
}

const ChatInterface = ({ onRecordingRequest }: ChatInterfaceProps) => {
  const { messages, input, handleInputChange, handleSubmit, append } = useChat({
    api: "/api/chat",
    onError: (err) => {
      console.error(err);
    },
  });

  const [showRecordingUI, setShowRecordingUI] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const processedMessageIds = useRef(new Set<string>());

  // 録音リクエストを処理
  const handleRecordingRequest = useCallback(async () => {
    try {
      setIsRecording(true);
      await onRecordingRequest?.();
      // 録音完了後、チャットにメッセージを追加
      append({
        role: "user",
        content: `音声の録音とアップロードが完了しました！`,
      });
    } catch (error) {
      console.error("録音処理エラー:", error);
      append({
        role: "user",
        content: `音声の録音中にエラーが発生しました。`,
      });
    } finally {
      setIsRecording(false);
      setShowRecordingUI(false);
    }
  }, [onRecordingRequest, append]);

  // messagesの変更を監視してtool callを検出
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];

      // 既に処理済みのメッセージかチェック
      if (processedMessageIds.current.has(lastMessage.id)) {
        return;
      }

      // assistantのメッセージでstartRecording tool invocationがある場合
      if (lastMessage.role === "assistant" && lastMessage.parts) {
        let hasStartRecordingTool = false;
        lastMessage.parts.forEach((part) => {
          if (
            part.type === "tool-invocation" &&
            part.toolInvocation.toolName === "startRecording"
          ) {
            hasStartRecordingTool = true;
          }
        });

        if (hasStartRecordingTool) {
          setShowRecordingUI(true);
          processedMessageIds.current.add(lastMessage.id);
          // 自動で録音開始
          handleRecordingRequest();
        }
      }
    }
  }, [handleRecordingRequest, messages]);


  return (
    <>
      {messages.map((m) => (
        <div key={m.id} className="whitespace-pre-wrap flex flex-col gap-2">
          <strong>{`${m.role}: `}</strong>
          {m.content}

          {/* Tool invocationの結果を表示 */}
          {m.parts?.map((part) => {
            if (
              part.type === "tool-invocation" &&
              part.toolInvocation.toolName === "startRecording"
            ) {
              return (
                <div
                  key={part.toolInvocation.toolCallId}
                  className="p-3 bg-red-50 border-l-4 border-red-400 rounded"
                >
                  <p className="text-red-800 font-semibold">🎤 録音開始</p>
                  <p className="text-red-600">
                    {part.toolInvocation.args.message}
                  </p>
                </div>
              );
            }
            return null;
          })}
        </div>
      ))}

      {/* 録音UI */}
      {showRecordingUI && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 w-full max-w-md border border-gray-300 rounded-lg p-4 bg-white shadow-lg z-10">
          <div className="flex items-center gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-red-500 font-semibold">
                {isRecording ? "録音中..." : "録音処理中..."}
              </span>
            </div>
            {isRecording && (
              <button
                type="button"
                onClick={() => {
                  if ((window as any).stopRecording) {
                    (window as any).stopRecording();
                  }
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-sm"
              >
                ⏹️ 停止
              </button>
            )}
          </div>
        </div>
      )}

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
};

ChatInterface.displayName = "ChatInterface";

export default ChatInterface;
