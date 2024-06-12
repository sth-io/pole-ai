import { create } from "zustand";
import config from "../../config";

export const useRead = create((set) => ({
  isReading: false,
  readingEnabled: false,
  audioSrc: "",
  currentlyReads: -1,
  speaker_id: "p230",
  sentenceQueue: [],
  audioBank: [],
  setSrc: (value) => {
    set({ audioSrc: value });
  },
  setCurrent: (value) => {
    set(() => ({
      currentlyReads: value,
    }));
  },
  cleanup: () => {
    set(() => ({
      audioSrc: "",
      currentlyReads: -1,
      sentenceQueue: [],
      audioBank: [],
    }));
  },
  setTTS: (value) => {
    set(() => ({
      readingEnabled: value,
    }));
  },
  addAudio: (id, value) => {
    set(({ audioBank }) => {
      const newBank = [...audioBank];
      newBank[id] = value;
      return { audioBank: newBank };
    });
  },
}));

/**
 * Plays audio file from base65 string
 * @param {string} base64String audio file
 */
export const playAudio = (base64String) => {
  var audio = new Audio(base64String);
  audio.onended = () => {
    const currentlyReads = useRead.getState().currentlyReads;
    if (currentlyReads > -1) {
      useRead.setState({
        isReading: false,
        currentlyReads: currentlyReads + 1,
      });
    }
  };
  audio.play();
};

export const processChunksToAudio = (speaker_id, addAudio) => {
  let sentence = "";
  let sentenceId = 0;
  // process incoming chunks into sentences
  const chunkHandler = ({ detail }) => {
    if (!detail) {
      return;
    }
    const { id, content } = detail;
    const stopSigns = [".", ",", "!", "?", ";", ":"];
    const sentenceEnd = stopSigns.find((sign) => content.indexOf(sign) > -1);
    if (sentenceEnd) {
      if (stopSigns.indexOf(sentence) === -1) {
        if (!stopSigns.includes(`${sentence}${content}`)) {
          const finalSentence = `${sentence}${content}`;
          const currentId = sentenceId;
          synthesize(finalSentence, speaker_id, (audio) =>
            useRead.getState().addAudio(currentId, audio)
          );
          // make spot
          useRead.getState().addAudio(currentId, undefined);
          sentenceId = sentenceId + 1;
        }
      }
      sentence = "";
    } else {
      sentence = sentence + content;
    }
  };
  return chunkHandler;
};

/**
 * Queries speaker audio based on text
 * @param {*} text
 * @param {*} speaker
 * @param {*} cb
 */
export const synthesize = async (text, speaker, cb) => {
  const toSay = encodeURIComponent(text.replace(/\*/g, ""));
  const speakerId = encodeURIComponent(speaker);
  try {
    const url = `${config.apiUrl}/api/tts?text=${toSay}&speaker_id=${speakerId}&style_wav=""&language_id=""`;

    fetch(url).then(async (resp) => {
      const blob = await resp.blob();
      let reader = new FileReader();
      reader.readAsDataURL(blob);

      reader.onloadend = function () {
        const base64String = reader.result;
        cb(base64String);
      };
    });
  } catch (err) {
    console.log("err", err);
  }
};
