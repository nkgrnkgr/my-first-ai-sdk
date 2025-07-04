"use client";

import dynamic from "next/dynamic";

// すべてのクライアント機能をdynamic importで分離
const AudioRecorder = dynamic(() => import("@/components/AudioRecorder"), {
  ssr: false,
  loading: () => (
    <div className="border border-gray-300 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">音声録音</h3>
      <div className="text-gray-500">読み込み中...</div>
    </div>
  ),
});

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
  const handleUploadComplete = (fileId: number) => {
    console.log("音声ファイルがアップロードされました:", fileId);
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <AudioRecorder onUploadComplete={handleUploadComplete} />
      <ChatInterface onUploadComplete={handleUploadComplete} />
    </div>
  );
}
