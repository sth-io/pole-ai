import axios from "axios";
import { config } from "../config";
import { Severity, log } from "../utils/logging";

export const proxyTTS = (req, res) => {
  const { text, speaker_id, style_wav, language_id } = req.query;
  const url = `${config.coqui.url}/api/tts?text=${text}&speaker_id=${speaker_id}&style_wav=${style_wav}&language_id=${language_id}`;
  axios
    .get(url, {
      responseType: "arraybuffer",
      headers: {
        "Content-Type": "audio/wav",
      },
    })
    .then((response) => {
      res.set("Content-Type", response.headers["content-type"]);
      res.send(response.data);
    })
    .catch((error) => {
      log(Severity.error, 'proxyTTS', 'error fetching data')
      res.status(500).send({ message: "Error fetching data" });
    });
};
