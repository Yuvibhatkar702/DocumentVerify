const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const AI_ML_SERVICE_URL = process.env.AI_ML_SERVICE_URL || 'http://localhost:8000';

class AIMlService {
  async analyzeDocument(filePath, documentType) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('document_type', documentType);

      const response = await axios.post(`${AI_ML_SERVICE_URL}/analyze`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 seconds timeout
      });

      return this.processAnalysisResult(response.data);
    } catch (error) {
      console.error('AI/ML Service error:', error);
      
      // Return a fallback result if the service is unavailable
      return {
        isValid: false,
        confidenceScore: 0,
        detectedText: '',
        extractedData: {},
        anomalies: ['AI/ML service unavailable'],
        verificationMethod: 'ai-ml'
      };
    }
  }

  async performOCR(filePath) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await axios.post(`${AI_ML_SERVICE_URL}/ocr`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('OCR Service error:', error);
      throw new Error('OCR processing failed');
    }
  }

  async detectSignature(filePath) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await axios.post(`${AI_ML_SERVICE_URL}/detect-signature`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('Signature detection error:', error);
      throw new Error('Signature detection failed');
    }
  }

  async validateDocumentFormat(filePath, documentType) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('document_type', documentType);

      const response = await axios.post(`${AI_ML_SERVICE_URL}/validate-format`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('Format validation error:', error);
      throw new Error('Document format validation failed');
    }
  }

  processAnalysisResult(rawResult) {
    return {
      isValid: rawResult.is_valid || false,
      confidenceScore: rawResult.confidence_score || 0,
      detectedText: rawResult.detected_text || '',
      extractedData: rawResult.extracted_data || {},
      anomalies: rawResult.anomalies || [],
      processingTime: rawResult.processing_time || 0,
      verificationDetails: {
        ocrAccuracy: rawResult.ocr_accuracy || 0,
        signatureDetected: rawResult.signature_detected || false,
        formatValidation: rawResult.format_validation || {},
        qualityScore: rawResult.quality_score || 0
      }
    };
  }

  async checkServiceHealth() {
    try {
      const response = await axios.get(`${AI_ML_SERVICE_URL}/health`, {
        timeout: 5000
      });
      return response.status === 200;
    } catch (error) {
      console.error('AI/ML Service health check failed:', error);
      return false;
    }
  }
}

module.exports = new AIMlService();
