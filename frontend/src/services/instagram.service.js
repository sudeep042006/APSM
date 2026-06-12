import api from './api.js';

export const getInstagramAnalytics = async () => {
  try {
    const response = await api.get('/analytics/instagram');
    return response.data;
  } catch (error) {
    console.error('Error fetching Instagram analytics:', error);
    throw error;
  }
};
