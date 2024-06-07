// http://192.168.0.172:6553/search?format=json&q=rich
import eventBus from "./eventBus";

import axios from "axios";
import { config } from "../config";

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export const SearchXng = () => {
  const cleanResults = (res) => {
    return {
      url: res.url,
      title: res.title,
      content: res.content,
    };
  };

  const search = async (query, limit = 10) => {
    const call = async (tries = 3) => {
      try {
        const results = await axios.get(
          `${config.searchXng.url}/search?format=json&q=${encodeURI(query)}`
        );
        return results.data.results.map(cleanResults).slice(0, limit);
      } catch (e) {
        eventBus.emit("error", {
          message: {
            msg: `(${
              4 - tries
            }/3) Failed to get search data for query: ${query}`,
            status: tries === 1 ? "error" : "warning",
          },
        });
        console.log(e);
        if (tries > 1) {
          await sleep(500);
          return call(tries - 1);
        }
      }
    };

    return call();
  };

  return {
    search,
  };
};
