const params = new URLSearchParams(window.location.search);
const api = params.get("api");

const config = {
  apiUrl: api || process.env.REACT_APP_API || window.REACT_APP_API_URL || ``,
};

export default config;
