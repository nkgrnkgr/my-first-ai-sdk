"use client";

import { useRef, useState } from "react";

interface AudioRecorderProps {
  onUploadComplete?: (fileId: number) => void;
}

export default function AudioRecorder({
  onUploadComplete,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);

      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // ストリームを停止
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // タイマー開始
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("録音開始エラー:", error);
      alert("マイクへのアクセスを許可してください");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const uploadAudio = async () => {
    if (!audioChunksRef.current.length) return;

    setIsUploading(true);

    try {
      const audioBlob = new Blob(audioChunksRef.current, {
        type: "audio/webm",
      });
      const formData = new FormData();
      formData.append("audio", audioBlob, `recording_${Date.now()}.webm`);

      const response = await fetch("/api/upload-audio", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("アップロードに失敗しました");
      }

      const result = await response.json();

      if (result.success) {
        alert("音声ファイルがアップロードされました！");
        onUploadComplete?.(result.fileId);

        // リセット
        setAudioUrl(null);
        audioChunksRef.current = [];
        setRecordingTime(0);
      } else {
        throw new Error(result.error || "アップロードに失敗しました");
      }
    } catch (error) {
      console.error("アップロードエラー:", error);
      alert("アップロードに失敗しました");
    } finally {
      setIsUploading(false);
    }
  };

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
              onClick={() => {
                setAudioUrl(null);
                audioChunksRef.current = [];
                setRecordingTime(0);
              }}
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
