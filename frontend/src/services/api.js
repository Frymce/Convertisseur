import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const FRONTEND_URL = process.env.REACT_APP_FRONTEND_URL || window.location.origin;

export const uploadConvertedFile = async (blob, fileName) => {
  const formData = new FormData();
  formData.append('convertedFile', blob, fileName);

  const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Retourne l'URL de la page de partage frontend (pas l'endpoint backend direct)
export const getDownloadUrl = (fileId) => {
  return `${FRONTEND_URL}/share/${fileId}`;
};
