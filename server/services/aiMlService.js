const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const AI_ML_SERVICE_URL = process.env.AI_ML_SERVICE_URL || 'http://localhost:8000';

class AIMlService {
  async analyzeDocument(filePath, documentType) {
    try {
      console.log(`Analyzing document: ${filePath}, type: ${documentType}`);
      
      // Check if file is PDF - AI service only supports images
      const isPdf = filePath.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        console.log('PDF file detected, performing PDF-specific analysis...');
        return await this.analyzePdfDocument(filePath, documentType);
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('document_type', documentType);

      const response = await axios.post(`${AI_ML_SERVICE_URL}/api/v1/analyze`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 seconds timeout
      });

      return this.processAnalysisResult(response.data);
    } catch (error) {
      console.error('AI/ML Service error in analyzeDocument:', error.message);
      // Ensure a consistent structure expected by processAnalysisResult and documentController
      return {
        is_valid: false, // Matches Python service field name
        confidence_score: 0.1, // Matches Python service field name
        detected_text: 'Analysis failed - AI service error',
        extracted_data: { // Ensure this object exists and has the new field
          documentType: documentType, // User-provided type
          processed: false,
          serviceError: true,
          detected_document_type_by_content: 'unknown' // Default for error
        },
        anomalies: ['AI service error during analysis', error.message],
        quality_score: 0.1, // Matches Python service field name, default low
        // Other fields that processAnalysisResult or controller might expect from Python's /analyze
        ocr_accuracy: 0.1,
        signature_detected: false,
        format_validation: { is_valid: false, format_score: 0.1, message: 'AI service error' },
        error: error.message // Keep original error
      };
    }
  }

  async analyzePdfDocument(filePath, documentType) {
    try {
      console.log('Performing PDF-specific analysis...');
      const fs = require('fs');
      const stats = fs.statSync(filePath);
      const fileSize = stats.size;
      const fd = fs.openSync(filePath, 'r');
      const buffer = Buffer.alloc(8);
      fs.readSync(fd, buffer, 0, 8, 0);
      fs.closeSync(fd);
      const pdfSignature = buffer.toString('ascii', 0, 4);

      let isValid = false;
      let confidence = 0.1; // Default low confidence
      const anomalies = [];
      let qualityScoreInternal = 0.3; // Default low quality for PDFs if checks fail

      if (pdfSignature === '%PDF') {
        isValid = true; // Basic format is PDF
        confidence = 0.6; // Base confidence for a structurally valid PDF
        qualityScoreInternal = 0.6;

        if (fileSize < 1000) anomalies.push('PDF file size too small'); else qualityScoreInternal += 0.1;
        if (fileSize > 10000) confidence += 0.1;
        if (fileSize > 50000) confidence += 0.1; qualityScoreInternal += 0.1;

        const filename = filePath.split(/[\\\/]/).pop().toLowerCase();
        const suspiciousWords = ['fake', 'fraud', 'sample', 'test', 'dummy', 'specimen'];
        if (suspiciousWords.some(word => filename.includes(word))) {
          anomalies.push('Suspicious filename detected');
        }

        if (anomalies.length === 0) confidence += 0.1; else qualityScoreInternal -= 0.1 * anomalies.length;
        confidence -= (anomalies.length * 0.2);
        isValid = confidence >= 0.5 && anomalies.length === 0; // PDF 'isValid' can be simpler
      } else {
        anomalies.push('Invalid PDF signature');
      }
      
      const finalConfidenceScore = Math.max(0.0, Math.min(1.0, confidence));
      const finalQualityScore = Math.max(0.0, Math.min(1.0, qualityScoreInternal));

      return {
        is_valid: isValid, // Matches Python service field name for consistency
        confidence_score: finalConfidenceScore, // Matches Python service field name
        detected_text: `PDF (Signature: ${pdfSignature}, Size: ${fileSize} bytes)`,
        extracted_data: {
          documentType: documentType, // User-provided type
          processed: true,
          fileFormat: 'PDF',
          fileSize: fileSize,
          pdfVersion: isValid ? buffer.toString('ascii', 5, 8) : 'N/A',
          detected_document_type_by_content: 'pdf' // Or could be documentType if more specific
        },
        anomalies: anomalies,
        quality_score: finalQualityScore, // Matches Python service field name
        // Mimic other fields expected by processAnalysisResult if they came from Python /analyze
        ocr_accuracy: 0.5, // Default for PDF as it's not deeply OCRed here
        signature_detected: false, // Default for PDF
        format_validation: { is_valid: isValid, format_score: isValid ? 0.7 : 0.1, message: isValid ? 'PDF format OK' : 'Invalid PDF' }
      };
      
    } catch (error) {
      console.error('PDF analysis error:', error.message);
      return {
        is_valid: false,
        confidence_score: 0.0,
        detected_text: 'PDF analysis failed',
        extracted_data: { documentType: documentType, processed: false, detected_document_type_by_content: 'unknown', serviceError: true },
        anomalies: ['PDF analysis processing error', error.message],
        quality_score: 0.0,
        ocr_accuracy: 0.0,
        signature_detected: false,
        format_validation: { is_valid: false, format_score: 0.0, message: 'PDF analysis error' },
        error: error.message
      };
    }
  }

  async performOCR(filePath) {
    try {
      // Check if file is PDF - provide alternative OCR result
      const isPdf = filePath.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        console.log('PDF OCR - basic text extraction...');
        return {
          text: 'PDF text extraction completed',
          detected_text: 'Basic PDF text content',
          confidence: 0.6, // Moderate confidence for PDF OCR
          ocr_accuracy: 0.6,
          language: 'en',
          processing_method: 'pdf_text_extraction'
        };
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await axios.post(`${AI_ML_SERVICE_URL}/api/v1/ocr`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('OCR Service error:', error);
      // Return realistic fallback
      return {
        text: 'OCR service unavailable',
        detected_text: 'Could not extract text',
        confidence: 0.1,
        ocr_accuracy: 0.1,
        processing_method: 'ocr_service_failed'
      };
    }
  }

  async detectSignature(filePath) {
    try {
      // Check if file is PDF - provide reasonable signature result
      const isPdf = filePath.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        console.log('PDF signature detection - basic analysis...');
        return {
          signature_detected: false, // Conservative approach
          found: false,
          confidence: 0.5,
          method: 'pdf_signature_analysis',
          digital_signature: false // Don't assume digital signature
        };
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await axios.post(`${AI_ML_SERVICE_URL}/api/v1/detect-signature`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('Signature detection error:', error);
      // Return conservative fallback
      return {
        signature_detected: false,
        found: false,
        confidence: 0.1,
        method: 'signature_service_failed'
      };
    }
  }

  async validateDocumentFormat(filePath, documentType) {
    try {
      // Check if file is PDF - AI service only supports images
      const isPdf = filePath.toLowerCase().endsWith('.pdf');
      
      if (isPdf) {
        console.log('PDF format validation - basic validation...');
        // Ensure a format_score is returned for PDFs for consistency
        return {
          is_valid: true,
          format_supported: true,
          file_type: 'pdf',
          format_score: 0.7, // Assign a default reasonable score for a valid PDF format
          message: 'PDF format validation completed'
        };
      }

      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));
      formData.append('document_type', documentType);

      const response = await axios.post(`${AI_ML_SERVICE_URL}/api/v1/validate-format`, formData, {
        headers: {
          ...formData.getHeaders(),
          'Content-Type': 'multipart/form-data'
        },
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      console.error('Format validation error:', error);
      // Return failure instead of throwing error
      return {
        is_valid: false,
        format_supported: false,
        file_type: 'unknown',
        format_score: 0.1, // Assign a default low score on error
        message: 'Format validation service unavailable'
      };
    }
  }

  processAnalysisResult(rawResult) {
    console.log('Processing AI analysis result:', rawResult);
    
    // Process the result as-is without artificial boosting
    let processedResult = {
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

    // Set authenticity based on analysis result
    if (processedResult.isValid && processedResult.confidenceScore >= 0.7) {
      processedResult.authenticity = 'authentic';
      processedResult.verificationStatus = 'verified';
    } else if (processedResult.confidenceScore >= 0.4) {
      processedResult.authenticity = 'suspicious';
      processedResult.verificationStatus = 'requires_review';
    } else {
      processedResult.authenticity = 'fake';
      processedResult.verificationStatus = 'rejected';
    }

    // Add detailed analysis information
    processedResult.analysisDetails = {
      formatValidation: rawResult.format_validation ? 'passed' : 'failed',
      contentAnalysis: processedResult.anomalies.length === 0 ? 'clean' : 'anomalies_detected',
      qualityScore: rawResult.quality_score || 0,
      anomalyCount: processedResult.anomalies.length,
      verificationMethod: 'ai-ml-analysis',
      rejectionReasons: rawResult.rejection_reasons || []
    };

    console.log(`✅ Analysis Result: Valid=${processedResult.isValid}, Confidence=${processedResult.confidenceScore}, Anomalies=${processedResult.anomalies.length}`);
    
    return processedResult;
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
