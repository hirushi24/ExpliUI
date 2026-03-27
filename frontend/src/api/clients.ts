import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const UPLOAD_API_BASE_URL = import.meta.env.VITE_UPLOAD_API_BASE_URL || "/upload-api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const uploadApi = axios.create({
  baseURL: UPLOAD_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});