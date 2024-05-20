import { Chroma } from "@langchain/community/vectorstores/chroma";
import { OllamaEmbeddings } from "@langchain/community/embeddings/ollama";

import { config } from "../config";
import axios from "axios";

export const ChromaModel = (collection = "", model = "") => {
  const embeddings =
    collection &&
    new OllamaEmbeddings({
      model: model || config.ollama.fallbackModel,
      baseUrl: config.ollama.server,
    });

  const chromaConf = {
    collectionName: collection,
    url: config.chroma.server,
    collectionMetadata: {
      "hnsw:space": "cosine",
    },
  };

  const embed = async (text) => {
    if (Array.isArray(text)) {
      const embeds = await embeddings.embedDocuments(text);
      return embeds;
    } else {
      const embeds = await embeddings.embedQuery(text);
      return embeds;
    }
  };

  const fromExistingCollection = async () => {
    return Chroma.fromExistingCollection(embeddings, chromaConf);
  };

  const fromTexts = async (files, meta) => {
    return Chroma.fromTexts(files, meta, embeddings, chromaConf);
  };

  const listCollections = async () => {
    const url = `${config.chroma.server}/api/v1/collections`;
    const result = await axios.get(url);
    return result.data;
  };

  const addToCollection = async (texts) => {
    const embedding = await embed(texts.map((elem) => elem.content));
    const payload = {
      embeddings: embedding,
      metadatas: texts.map((elem) => elem.metadata),
      documents: texts.map((elem) => elem.content),
      //   uris: texts.map((elem) => elem.path),
      ids: texts.map((elem) => elem.id),
    };
    console.log(payload);
    const collectionUrl = `${config.chroma.server}/api/v1/collections`;
    const collectionData = await axios.post(
      collectionUrl,
      {
        name: collection,
        metadata: { name: collection, "hnsw:space": "cosine" },
        get_or_create: true,
        tenant: "default_tenant",
        database: "default_database",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const collectionId = collectionData.data.id;
    console.log("chroma id", collectionId);
    const url = `${config.chroma.server}/api/v1/collections/${collectionId}/add`;
    const result = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(result.status);
  };

  // const query = async (query) => {
  //   return (
  //     await Chroma.fromExistingCollection(embeddings, chromaConf)
  //   ).similaritySearchWithScore(query, 100);
  // };

  const query = async (query, limit = 20) => {
    const embedding = await embed([query]);
    const collectionUrl = `${config.chroma.server}/api/v1/collections`;
    const collectionData = await axios.post(
      collectionUrl,
      {
        name: collection,
        metadata: { name: collection, "hnsw:space": "cosine" },
        get_or_create: true,
        tenant: "default_tenant",
        database: "default_database",
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const collectionId = collectionData.data.id;
    const payload = {
      //   where: {},
      //   where_document: {},
      query_embeddings: embedding,
      n_results: limit,
      include: ["metadatas", "documents", "distances", "data"],
    };
    const queryUrl = `${config.chroma.server}/api/v1/collections/${collectionId}/query`;
    const resp = await axios.post(queryUrl, payload);
    console.log({ resp });
    return resp.data;
  };

  const remove = async () => {
    const queryUrl = `${config.chroma.server}/api/v1/collections/${collection}`;
    const resp = await axios.delete(queryUrl);
    return resp.data
  }

  return {
    fromExistingCollection,
    fromTexts,
    listCollections,
    query,
    addToCollection,
    remove,
  };
};
