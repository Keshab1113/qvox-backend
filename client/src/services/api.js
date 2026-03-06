import axios from "axios";

const api = axios.create({
  baseURL: "/api",
});

// Add admin key to requests
api.interceptors.request.use((config) => {
  const adminKey = localStorage.getItem("adminKey");
  if (adminKey) {
    config.headers["x-admin-key"] = adminKey;
  }
  return config;
});

// API Keys
export const getApiKeys = async () => {
  const { data } = await api.get(
    `${import.meta.env.VITE_BACKEND_URL}/admin/keys`,
  );
  return data.keys;
};

export const createApiKey = async ({ key_name }) => {
  const { data } = await api.post(
    `${import.meta.env.VITE_BACKEND_URL}/admin/keys`,
    { key_name },
  );
  return data;
};

export const updateApiKey = async (id, updates) => {
  const { data } = await api.patch(
    `${import.meta.env.VITE_BACKEND_URL}/admin/keys/${id}`,
    updates,
  );
  return data;
};

export const deleteApiKey = async (id) => {
  const { data } = await api.delete(
    `${import.meta.env.VITE_BACKEND_URL}/admin/keys/${id}`,
  );
  return data;
};

// Transcription
export const transcribeFile = async (formData) => {
  const apiKey = import.meta.env.VITE_QVOX_API_KEY;
  const { data } = await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/v1/transcribe`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "multipart/form-data",
      },
    },
  );
  return data;
};

export const transcribeUrl = async ({ url, model }) => {
  const apiKey = import.meta.env.VITE_QVOX_API_KEY;
  const formData = new FormData();
  formData.append("url", url);
  formData.append("model", model);

  const { data } = await axios.post(
    `${import.meta.env.VITE_BACKEND_URL}/v1/transcribe`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    },
  );
  return data;
};

// Logs
export const getLogs = async (params) => {
  const { data } = await api.get(
    `${import.meta.env.VITE_BACKEND_URL}/admin/logs`,
    { params },
  );
  return data;
};

export const getLog = async (requestId) => {
  const { data } = await api.get(
    `${import.meta.env.VITE_BACKEND_URL}/admin/logs/${requestId}`,
  );
  return data;
};

// Stats
export const getStats = async () => {
  const { data } = await api.get(
    `${import.meta.env.VITE_BACKEND_URL}/admin/stats`,
  );
  return data;
};

export default api;
