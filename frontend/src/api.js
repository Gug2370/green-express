import axios from "axios";

// Send API calls to the Express server and attach the user's token when present.
const api = axios.create({ baseURL: "http://localhost:8800/api" });
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = "Bearer " + token;
  return config;
});

export function errorMessage(err) {
  return err.response?.data?.message || "Cannot reach the server. Is the backend running on port 8800?";
}

export function formatPrice(amount) {
  return "NPR " + Number(amount).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatDate(date) {
  return new Date(date).toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default api;
