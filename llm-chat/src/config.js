const params = new URLSearchParams(window.location.search);
const api = params.get("api");
const socket = params.get("socket");

const config = {
  apiUrl: api || window.REACT_APP_API_URL || ``,
  socketUrl: socket || window.REACT_APP_SOCKET_URL || ``,
};

export default config;
