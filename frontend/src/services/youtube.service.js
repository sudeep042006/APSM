import api from './api.js';

export const getYouTubeAnalytics = async () => {
  try {
    const response = await api.get('/analytics/youtube');
    return response.data;
  } catch (error) {
    console.error('Error fetching YouTube analytics:', error);
    throw error;
  }
};
