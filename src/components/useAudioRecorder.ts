import { useCallback, useRef, useState } from "react";

interface UseAudioRecorderReturn {
  isRecording: boolean;
  isUploading: boolean;
  recordingTime: number;
  audioUrl: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  uploadAudio: () => Promise<void>;
  clearRecording: () => void;
}

export function useAudioRecorder(
  onUploadComplete?: (fileId: number) => void
): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = useCallback(async () => {
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
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const uploadAudio = useCallback(async () => {
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
  }, [onUploadComplete]);

  const clearRecording = useCallback(() => {
    setAudioUrl(null);
    audioChunksRef.current = [];
    setRecordingTime(0);
  }, []);

  return {
    isRecording,
    isUploading,
    recordingTime,
    audioUrl,
    startRecording,
    stopRecording,
    uploadAudio,
    clearRecording,
  };
}
