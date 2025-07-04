"use client";

import { useAudioRecorder } from "./useAudioRecorder";

interface AudioRecorderProps {
  onUploadComplete?: (fileId: number) => void;
}

export default function AudioRecorder({
  onUploadComplete,
}: AudioRecorderProps) {
  const {
    isRecording,
    isUploading,
    recordingTime,
    audioUrl,
    startRecording,
    stopRecording,
    uploadAudio,
    clearRecording,
  } = useAudioRecorder(onUploadComplete);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="border border-gray-300 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">音声録音</h3>

      <div className="flex items-center gap-4 mb-4">
        {!isRecording ? (
          <button
            type="button"
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            🎤 録音開始
          </button>
        ) : (
          <button
            type="button"
            onClick={stopRecording}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            ⏹️ 録音停止
          </button>
        )}

        {isRecording && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-red-500 font-mono">
              {formatTime(recordingTime)}
            </span>
          </div>
        )}
      </div>

      {audioUrl && (
        <div className="mb-4">
          {/** biome-ignore lint/a11y/useMediaCaption: <explanation> */}
          <audio controls className="w-full mb-3">
            <source src={audioUrl} type="audio/webm" />
            お使いのブラウザは音声再生に対応していません。
          </audio>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={uploadAudio}
              disabled={isUploading}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg"
            >
              {isUploading ? "アップロード中..." : "📤 アップロード"}
            </button>

            <button
              type="button"
              onClick={clearRecording}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg"
            >
              🗑️ 削除
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
