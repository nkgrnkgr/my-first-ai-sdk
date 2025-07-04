"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import type { ChatInterfaceRef } from "@/components/ChatInterface";

// すべてのクライアント機能をdynamic importで分離
const AudioRecorder = dynamic(() => import("@/components/AudioRecorder"), {
  ssr: false,
  loading: () => null, // 録音UIは最初は非表示なのでローディングも表示しない
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

export interface AudioRecorderRef {
  startRecording: () => void;
  stopRecording: () => void;
}

export default function Chat() {
  const audioRecorderRef = useRef<AudioRecorderRef>(null);
  const chatInterfaceRef = useRef<ChatInterfaceRef>(null);
  const [showRecorder, setShowRecorder] = useState(false);

  const handleUploadComplete = (fileId: number) => {
    console.log("音声ファイルがアップロードされました:", fileId);
    // チャットに通知
    chatInterfaceRef.current?.notifyUploadComplete(fileId);
    // アップロード完了後、録音UIを隠す
    setShowRecorder(false);
  };

  const handleRecordingComplete = () => {
    console.log("録音が完了しました。UIを隠します。");
    // 録音完了後、UIを隠すかどうかはここで制御可能
    // setShowRecorder(false); // 完了後にUIを隠す場合
  };

  const handleStartRecording = () => {
    console.log("録音UI表示 & 録音開始");
    setShowRecorder(true);
    // 少し遅延を入れてコンポーネントがマウントされてから録音開始
    setTimeout(() => {
      audioRecorderRef.current?.startRecording();
    }, 100);
  };

  const handleStopRecording = () => {
    audioRecorderRef.current?.stopRecording();
  };

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <ChatInterface 
        ref={chatInterfaceRef}
        onUploadComplete={handleUploadComplete}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
      />
      {showRecorder && (
        <AudioRecorder 
          ref={audioRecorderRef}
          onUploadComplete={handleUploadComplete}
          onRecordingComplete={handleRecordingComplete}
        />
      )}
    </div>
  );
}
