"use client";

import dynamic from "next/dynamic";
import { recordAndUpload } from "@/components/AudioRecorder";

const ChatInterface = dynamic(() => import("@/components/ChatInterface"), {
  ssr: false,
  loading: () => (
    <>
      <div className="text-gray-500 mb-4">チャット機能を読み込み中...</div>
      <div className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl bg-gray-100">
        <div className="text-gray-400">読み込み中...</div>
      </div>
    </>
  ),
});

export default function Chat() {
  const handleRecordingRequest = async (): Promise<number> => {
    console.log("録音開始リクエスト");
    const fileId = await recordAndUpload();
    console.log("録音完了、ファイルID:", fileId);
    return fileId;
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <ChatInterface onRecordingRequest={handleRecordingRequest} />
    </div>
  );
}
