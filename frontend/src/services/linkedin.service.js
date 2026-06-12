import api from './api.js';

export const getLinkedInAnalytics = async () => {
  try {
    const response = await api.get('/analytics/linkedin');
    return response.data;
  } catch (error) {
    console.error('Error fetching LinkedIn analytics:', error);
    throw error;
  }
};
