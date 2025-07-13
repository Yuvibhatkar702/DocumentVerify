const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

class OCRService {
  constructor() {
    // OCR.space API configuration
    this.apiKey = 'K89884034088957'; // Your provided API key
    this.baseUrl = 'https://api.ocr.space/parse/image';
    this.defaultOptions = {
      language: 'eng',
      isOverlayRequired: false,
      detectOrientation: true,
      isTable: false,
      scale: true,
      OCREngine: 2, // Use OCR Engine 2 for better accuracy
      isCreateSearchablePdf: false,
      isSearchablePdfHideTextLayer: false
    };
  }

  /**
   * Extract text from image/PDF using OCR.space API
   * @param {string} filePath - Path to the file
   * @param {Object} options - OCR options
   * @returns {Object} OCR result with extracted text and confidence
   */
  async extractText(filePath, options = {}) {
    try {
      console.log(`[OCRService] Starting OCR extraction for: ${filePath}`);
      
      // Check if file exists
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      // Check file size (OCR.space has limits)
      const stats = fs.statSync(filePath);
      const fileSizeInMB = stats.size / (1024 * 1024);
      if (fileSizeInMB > 10) {
        throw new Error(`File size too large: ${fileSizeInMB.toFixed(2)}MB. Maximum allowed: 10MB`);
      }

      // Prepare form data
      const formData = new FormData();
      
      // Read file as buffer to avoid stream issues
      const fileBuffer = fs.readFileSync(filePath);
      const fileName = path.basename(filePath);
      
      // Add file with proper options
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: this.getContentType(filePath)
      });
      
      // Add API key
      formData.append('apikey', this.apiKey);
      
      // Add OCR options
      const ocrOptions = { ...this.defaultOptions, ...options };
      Object.keys(ocrOptions).forEach(key => {
        formData.append(key, String(ocrOptions[key]));
      });

      console.log(`[OCRService] Making OCR API request for file: ${fileName} (${fileSizeInMB.toFixed(2)}MB)`);

      // Make API request
      const response = await axios.post(this.baseUrl, formData, {
        headers: {
          ...formData.getHeaders(),
        },
        timeout: 30000, // 30 seconds timeout
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      console.log(`[OCRService] OCR API Response Status: ${response.status}`);
      
      if (response.data.IsErroredOnProcessing) {
        const errorMessages = response.data.ErrorMessage || response.data.ErrorDetails || ['Unknown error'];
        const errorMsg = Array.isArray(errorMessages) ? errorMessages.join(', ') : errorMessages;
        throw new Error(`OCR processing error: ${errorMsg}`);
      }

      // Extract and process results
      const result = this.processOCRResult(response.data);
      console.log(`[OCRService] OCR extraction completed. Text length: ${result.text.length}`);
      
      return result;

    } catch (error) {
      console.error(`[OCRService] OCR extraction failed:`, error.message);
      
      // Return fallback result
      return {
        success: false,
        text: '',
        confidence: 0,
        error: error.message,
        extractedData: {},
        textRegions: [],
        detectedLanguage: 'unknown'
      };
    }
  }

  /**
   * Process OCR API response and extract useful information
   * @param {Object} ocrResponse - Raw OCR API response
   * @returns {Object} Processed OCR result
   */
  processOCRResult(ocrResponse) {
    try {
      const parsedResults = ocrResponse.ParsedResults || [];
      
      if (parsedResults.length === 0) {
        return {
          success: false,
          text: '',
          confidence: 0,
          extractedData: {},
          textRegions: [],
          detectedLanguage: 'unknown'
        };
      }

      // Get the first parsed result
      const mainResult = parsedResults[0];
      const extractedText = mainResult.ParsedText || '';
      
      // Calculate confidence (OCR.space doesn't provide confidence, so we estimate it)
      const confidence = this.estimateConfidence(extractedText, mainResult);
      
      // Extract structured data from text
      const extractedData = this.extractStructuredData(extractedText);
      
      // Get text regions if available
      const textRegions = this.extractTextRegions(mainResult);

      return {
        success: true,
        text: extractedText.trim(),
        confidence: confidence,
        extractedData: extractedData,
        textRegions: textRegions,
        detectedLanguage: mainResult.Language || 'eng',
        processingTime: ocrResponse.ProcessingTimeInMilliseconds || 0,
        ocrEngine: mainResult.OCREngine || 'unknown'
      };

    } catch (error) {
      console.error(`[OCRService] Error processing OCR result:`, error.message);
      return {
        success: false,
        text: '',
        confidence: 0,
        error: error.message,
        extractedData: {},
        textRegions: [],
        detectedLanguage: 'unknown'
      };
    }
  }

  /**
   * Estimate confidence based on text quality and length
   * @param {string} text - Extracted text
   * @param {Object} result - OCR result object
   * @returns {number} Confidence score (0-1)
   */
  estimateConfidence(text, result) {
    if (!text || text.length === 0) return 0;

    let confidence = 0.6; // Increased base confidence for real documents

    // Text length factor - more generous for real documents
    if (text.length > 20) confidence += 0.15;
    if (text.length > 100) confidence += 0.15;
    if (text.length > 300) confidence += 0.1;

    // Check for common document patterns - more comprehensive
    const patterns = [
      /\b\d{4}[-/]\d{2}[-/]\d{2}\b/, // Dates
      /\b\d{2}[-/]\d{2}[-/]\d{4}\b/, // US date format
      /\b[A-Z]{2,3}\d{6,}\b/, // ID numbers
      /\b\d{4,}\b/, // Any 4+ digit numbers
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/, // Names
      /\b[A-Z][a-z]+\b/, // Single capitalized words
      /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/, // Phone numbers
      /\b[A-Z0-9]{6,}\b/, // Document numbers
      /\bID|CARD|LICENSE|PASSPORT|CERTIFICATE\b/i, // Document type keywords
      /\bNAME|DATE|BIRTH|ADDRESS|NUMBER\b/i, // Field labels
      /\b(MALE|FEMALE|M|F)\b/i, // Gender indicators
      /\b[A-Z]{2}\b/, // State codes
      /\$([\d,]+\.?\d*)|(\d+)\s*(USD|DOLLAR)/i // Currency
    ];

    let patternMatches = 0;
    patterns.forEach(pattern => {
      if (pattern.test(text)) {
        patternMatches++;
        confidence += 0.03; // Smaller individual boosts but more patterns
      }
    });

    // Bonus for multiple pattern matches (indicates structured document)
    if (patternMatches >= 3) confidence += 0.1;
    if (patternMatches >= 5) confidence += 0.1;

    // Check for meaningful words (not just random characters)
    const words = text.split(/\s+/).filter(word => word.length > 1);
    const meaningfulWords = words.filter(word => /^[A-Za-z0-9]+$/.test(word));
    
    if (meaningfulWords.length > words.length * 0.5) {
      confidence += 0.1;
    }
    if (meaningfulWords.length > words.length * 0.8) {
      confidence += 0.1;
    }

    // Check for proper capitalization (indicates real documents)
    const capitalizedWords = text.match(/\b[A-Z][a-z]+/g) || [];
    if (capitalizedWords.length >= 2) confidence += 0.05;

    // Check for numbers (common in official documents)
    const numbers = text.match(/\d+/g) || [];
    if (numbers.length >= 2) confidence += 0.05;

    // Penalty for very short text (likely not a real document)
    if (text.length < 10) confidence *= 0.3;

    return Math.max(0.1, Math.min(1.0, confidence));
  }

  /**
   * Extract structured data from text based on common document patterns
   * @param {string} text - Extracted text
   * @returns {Object} Structured data
   */
  extractStructuredData(text) {
    const data = {};

    try {
      // Common patterns for different document types
      const patterns = {
        // Dates
        dates: /\b(\d{1,2}[-/]\d{1,2}[-/]\d{4}|\d{4}[-/]\d{1,2}[-/]\d{1,2})\b/g,
        
        // Names (basic pattern)
        names: /\b([A-Z][a-z]+ [A-Z][a-z]+(?:\s[A-Z][a-z]+)*)\b/g,
        
        // Document numbers
        documentNumbers: /\b([A-Z0-9]{6,})\b/g,
        
        // Phone numbers
        phoneNumbers: /\b(\d{3}[-.]?\d{3}[-.]?\d{4})\b/g,
        
        // Email addresses
        emails: /\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b/g,
        
        // Addresses (basic pattern)
        addresses: /\b(\d+\s+[A-Za-z\s]+(?:Street|St|Avenue|Ave|Road|Rd|Drive|Dr|Lane|Ln|Way|Court|Ct|Place|Pl)\b)/gi
      };

      Object.keys(patterns).forEach(key => {
        const matches = text.match(patterns[key]);
        if (matches) {
          data[key] = matches;
        }
      });

      // Extract specific document fields based on keywords
      const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      lines.forEach(line => {
        // Look for common document field patterns
        if (line.toLowerCase().includes('name') && line.includes(':')) {
          const nameMatch = line.split(':')[1]?.trim();
          if (nameMatch) data.fullName = nameMatch;
        }
        
        if (line.toLowerCase().includes('date of birth') || line.toLowerCase().includes('dob')) {
          const dobMatch = line.match(/\b\d{1,2}[-/]\d{1,2}[-/]\d{4}\b/);
          if (dobMatch) data.dateOfBirth = dobMatch[0];
        }
        
        if (line.toLowerCase().includes('document number') || line.toLowerCase().includes('id number')) {
          const numMatch = line.match(/\b[A-Z0-9]{6,}\b/);
          if (numMatch) data.documentNumber = numMatch[0];
        }
      });

    } catch (error) {
      console.error(`[OCRService] Error extracting structured data:`, error.message);
    }

    return data;
  }

  /**
   * Extract text regions from OCR result
   * @param {Object} result - OCR result object
   * @returns {Array} Array of text regions with coordinates
   */
  extractTextRegions(result) {
    const regions = [];

    try {
      // OCR.space doesn't provide detailed word-level coordinates by default
      // This is a placeholder for text regions
      if (result.ParsedText) {
        const lines = result.ParsedText.split('\n').filter(line => line.trim().length > 0);
        
        lines.forEach((line, index) => {
          regions.push({
            text: line.trim(),
            confidence: 0.8, // Estimated confidence
            line: index + 1,
            // Note: OCR.space would need additional configuration to get actual coordinates
            coordinates: null
          });
        });
      }
    } catch (error) {
      console.error(`[OCRService] Error extracting text regions:`, error.message);
    }

    return regions;
  }

  /**
   * Get content type based on file extension
   * @param {string} filePath - Path to the file
   * @returns {string} Content type
   */
  getContentType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentTypes = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.bmp': 'image/bmp',
      '.tiff': 'image/tiff',
      '.tif': 'image/tiff',
      '.webp': 'image/webp',
      '.pdf': 'application/pdf'
    };
    return contentTypes[ext] || 'application/octet-stream';
  }

  /**
   * Get OCR service health status
   * @returns {Object} Health status
   */
  async getHealthStatus() {
    try {
      // Simple health check by making a minimal API call
      const testResponse = await axios.get('https://api.ocr.space/', {
        timeout: 5000
      });
      
      return {
        status: 'healthy',
        apiKey: this.apiKey ? 'configured' : 'missing',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        apiKey: this.apiKey ? 'configured' : 'missing',
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new OCRService();
