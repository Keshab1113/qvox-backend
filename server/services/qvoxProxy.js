const axios = require("axios");
const FormData = require("form-data");
const logger = require("../utils/logger");

const QVOX_BASE_URL = process.env.QVOX_BASE_URL || "https://api.drillingnwk.com/v1/transcribe";
const QVOX_TOKEN = process.env.QVOX_API_KEY;

/**
 * Proxy a file upload to QVox
 */
async function transcribeFile({ fileBuffer, originalname, mimetype, model = "QVox" }) {
  const form = new FormData();
  form.append("model", model);
  form.append("file", fileBuffer, { filename: originalname, contentType: mimetype });

  const response = await axios.post(QVOX_BASE_URL, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${QVOX_TOKEN}`,
    },
    // Remove timeout completely - no time limit
    maxBodyLength: Infinity,  // Allow unlimited body size
    maxContentLength: Infinity,  // Allow unlimited content length
  });

  return response;
}

/**
 * Proxy a URL-mode request to QVox
 */
async function transcribeUrl({ url, model = "QVox" }) {
  const form = new FormData();
  form.append("model", model);
  form.append("url", url);

  const response = await axios.post(QVOX_BASE_URL, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${QVOX_TOKEN}`,
    },
    // Remove timeout completely - no time limit
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  return response;
}

module.exports = { transcribeFile, transcribeUrl };