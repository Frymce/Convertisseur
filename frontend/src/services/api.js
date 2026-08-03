import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

export const getDownloadUrl = (fileId) => {
  return `${API_BASE_URL}/download/${fileId}`;
};
