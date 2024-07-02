import dotenv from 'dotenv'
dotenv.config()

const chroma = {
  server: process.env.CHROMA_SERVER,
};

const ollama = {
  server: process.env.OLLAMA_SERVER,
  fallbackModel: process.env.OLLAMA_FALLBACK_MODEL,
  api: {
    base: process.env.OLLAMA_API_BASE || `api`,
    tags: process.env.OLLAMA_API_TAGS || `api/tags`,
    chat: process.env.OLLAMA_API_CHAT || `api/chat`,
    generate: process.env.OLLAMA_API_GENERATE || `api/generate`,
  },
};

const searchXng = {
  url: process.env.SEARCHXNG_URL
}

const coqui = {
  url:  process.env.COQUI_URL
}

const server = {
  port: process.env.server_port || 3000,
  socketPort: process.env.scoket_port || 3001
}



const getConfig = () => {
  return { chroma, ollama, server, searchXng, coqui };
};

export const config = getConfig();
