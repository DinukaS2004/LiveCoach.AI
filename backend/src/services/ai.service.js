const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const config = require('../config/ai-service');

class AIService {
  async getAvailableSports() {
    try {
      const response = await axios.get(`${config.AI_SERVICE_URL}/sports`, {
        timeout: 5000
      });
      return response.data.sports;
    } catch (error) {
      throw new Error('Failed to fetch available sports: ' + error.message);
    }
  }

  async analyzeTechnique(videoPath, sport, shot) {
    try {
      const formData = new FormData();
      formData.append('video', fs.createReadStream(videoPath));

      const response = await axios.post(
        `${config.AI_SERVICE_URL}/analyze/${sport}/${shot}`,
        formData,
        {
          headers: {
            ...formData.getHeaders(),
            'X-API-Key': config.AI_SERVICE_KEY,
          },
          timeout: config.TIMEOUT,
          maxContentLength: Infinity,
          maxBodyLength: Infinity,
        }
      );

      return response.data;
    } catch (error) {
      if (error.response) {
        throw new Error(error.response.data.detail || 'Analysis failed');
      } else if (error.code === 'ECONNREFUSED') {
        throw new Error('AI service unavailable');
      } else {
        throw new Error('Analysis error: ' + error.message);
      }
    }
  }

  async checkHealth() {
    try {
      const response = await axios.get(`${config.AI_SERVICE_URL}/`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new AIService();