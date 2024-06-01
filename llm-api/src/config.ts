require('dotenv').config()

// currently not in use
const mongo = {
  server: process.env.MONGO_SERVER || `192.168.0.172`,
  port: process.env.MONGO_PORT || `27017`,
  db: process.env.MONGO_DB || `llm`,
  user: process.env.MONGO_USER || `llm`,
  password: process.env.MONGO_PASSWORD || `iU3%s5mK2QkBvW`,
};

// currently not in use
const opensearch = {
  server: process.env.OPENSEARCH_SERVER || `http://192.168.0.172:9200`
}

const chroma = {
  server: process.env.CHROMA_SERVER || `http://192.168.0.172:8101`,
};

const ollama = {
  server: process.env.OLLAMA_SERVER || `http://localhost:11434`,
  fallbackModel: process.env.OLLAMA_FALLBACK_MODEL || `mistral:latest`,
  api: {
    base: process.env.OLLAMA_API_BASE || `api`,
    tags: process.env.OLLAMA_API_TAGS || `api/tags`,
    chat: process.env.OLLAMA_API_CHAT || `api/chat`,
    generate: process.env.OLLAMA_API_GENERATE || `api/generate`,
  },
};

const server = {
  port: process.env.server_port || 3000,
  socketPort: process.env.scoket_port || 3001
}



const getConfig = () => {
  return { mongo, chroma, ollama, opensearch, server };
};

export const config = getConfig();
