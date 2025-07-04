"use client";

import { useRef, useState } from "react";

// 録音とアップロードを一体化した関数
export const recordAndUpload = async (
  onStopCallback?: () => void
): Promise<number> => {
  return new Promise((resolve, reject) => {
    let mediaRecorder: MediaRecorder;
    const audioChunks: Blob[] = [];
    let stream: MediaStream;

    // グローバルに停止関数を公開
    (window as any).stopRecording = () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
        console.log("手動録音停止");
      }
    };

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((mediaStream) => {
        stream = mediaStream;
        mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });

        mediaRecorder.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunks.push(event.data);
          }
        };

        mediaRecorder.onstop = async () => {
          try {
            const audioBlob = new Blob(audioChunks, { type: "audio/webm" });

            // アップロード処理
            const formData = new FormData();
            formData.append("audio", audioBlob, "recording.webm");

            const response = await fetch("/api/upload-audio", {
              method: "POST",
              body: formData,
            });

            if (!response.ok) {
              throw new Error("アップロードに失敗しました");
            }

            const result = await response.json();
            resolve(result.fileId);
          } catch (error) {
            reject(error);
          } finally {
            // ストリームを停止
            stream.getTracks().forEach((track) => track.stop());
            // グローバル関数をクリーンアップ
            delete (window as any).stopRecording;
          }
        };

        // 録音開始
        mediaRecorder.start();
        console.log("録音開始");

        // 10秒後に自動停止（デモ用）
        setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.stop();
            console.log("自動録音停止");
          }
        }, 10000);
      })
      .catch((error) => {
        reject(error);
      });
  });
};
