import axios from "axios";

const BASE_URL = "https://3100.api.green-api.com/";

const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  }
});

export default api;
