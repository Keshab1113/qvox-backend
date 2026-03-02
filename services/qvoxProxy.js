const axios = require("axios");
const FormData = require("form-data");
const logger = require("../utils/logger");

const QVOX_BASE_URL = process.env.QVOX_BASE_URL || "http://37.34.188.123:8000";
const QVOX_TOKEN = process.env.QVOX_TOKEN || "zdbsjgusgsbxzjgsfsadxdgdhagdfdadgdsdfgsd";
const TIMEOUT = parseInt(process.env.QVOX_TIMEOUT) || 120000;

/**
 * Proxy a file upload to QVox
 */
async function transcribeFile({ fileBuffer, originalname, mimetype, model = "QVox" }) {
  const form = new FormData();
  form.append("model", model);
  form.append("file", fileBuffer, { filename: originalname, contentType: mimetype });

  const response = await axios.post(`${QVOX_BASE_URL}/v1/transcribe`, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${QVOX_TOKEN}`,
    },
    timeout: TIMEOUT,
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
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

  const response = await axios.post(`${QVOX_BASE_URL}/v1/transcribe`, form, {
    headers: {
      ...form.getHeaders(),
      Authorization: `Bearer ${QVOX_TOKEN}`,
    },
    timeout: TIMEOUT,
  });

  return response;
}

module.exports = { transcribeFile, transcribeUrl };
