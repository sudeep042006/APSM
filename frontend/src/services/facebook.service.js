import api from './api.js';

export const getFacebookAnalytics = async () => {
  try {
    const response = await api.get('/analytics/facebook');
    return response.data;
  } catch (error) {
    console.error('Error fetching Facebook analytics:', error);
    throw error;
  }
};
