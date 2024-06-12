import React, { useEffect } from "react";
import { playAudio, processChunksToAudio, synthesize, useRead } from "./model";

export const ReadMessage = () => {
  const {
    speaker_id,
    currentlyReads,
    sentenceQueue,
    setCurrent,
    cleanup,
    readingEnabled,
    addAudio,
    audioBank,
    isReading,
  } = useRead();

  useEffect(() => {
    const handler = ({ detail }) => {
      if (!detail) {
        return;
      }
      const { id, content } = detail;
      synthesize(content, speaker_id, playAudio);
    };
    const chunkHandler = processChunksToAudio(speaker_id, addAudio);

    window.addEventListener("tts", handler);
    if (readingEnabled) {
      window.addEventListener("tts:chunks", chunkHandler);
    }

    return () => {
      window.removeEventListener("tts", handler);
      window.removeEventListener("tts:chunks", chunkHandler);
    };
  }, [readingEnabled]);

  useEffect(() => {
    if (audioBank.length > 0 && currentlyReads < 0) {
      setCurrent(0);
    }
  }, [audioBank]);

  useEffect(() => {
    if (!readingEnabled || isReading) {
      return;
    }
    if (
      audioBank.length > 0 &&
      currentlyReads >= 0 &&
      currentlyReads < audioBank.length
    ) {
      const audio = audioBank[currentlyReads];
      if (audio) {
        useRead.setState({
          isReading: true,
        });
        playAudio(audio);
      }
    }
    if (
      sentenceQueue.length > 0 &&
      currentlyReads >= 0 &&
      currentlyReads === sentenceQueue.length
    ) {
      cleanup();
    }
  }, [currentlyReads, readingEnabled, isReading, audioBank]);

  return null;
};
