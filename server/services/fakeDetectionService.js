/**
 * Fake Document Detection Service
 * Specifically designed to identify common fake document patterns and indicators
 */

class FakeDetectionService {
  constructor() {
    // Common fake document indicators
    this.fakePatterns = {
      // Common fake names and addresses
      fakePersonalInfo: [
        /\b(JOHN DOE|JANE DOE|TEST USER|SAMPLE USER|EXAMPLE USER)\b/i,
        /\b(123 MAIN ST|123 FAKE ST|123 TEST ST|456 EXAMPLE AVE)\b/i,
        /\b(ANYTOWN|ANYCITY|TESTCITY|SAMPLETOWN)\b/i,
        /\b(12345|00000|11111|99999)\b/ // Common fake zip codes
      ],
      
      // Fake document indicators
      fakeDocumentKeywords: [
        /\b(FAKE|FORGED|COUNTERFEIT|REPLICA|COPY|DUPLICATE)\b/i,
        /\b(TEST|SAMPLE|DUMMY|PLACEHOLDER|EXAMPLE|DEMO|TEMPLATE)\b/i,
        /\b(NOT VALID|VOID|SPECIMEN|PRACTICE|TRAINING)\b/i,
        /\b(SIMULATION|MOCK|FICTIONAL|PROTOTYPE)\b/i
      ],
      
      // Suspicious number patterns
      suspiciousNumbers: [
        /\b(123-45-6789|000-00-0000|111-11-1111|999-99-9999)\b/, // Fake SSNs
        /\b(0000000000|1111111111|1234567890|9876543210)\b/, // Sequential/repeated numbers
        /\b(555-0100|555-0199|555-0123)\b/ // Movie/test phone numbers
      ],
      
      // Low-quality/suspicious text patterns
      lowQualityText: [
        /[^\w\s]{5,}/, // Too many special characters clustered
        /\b[A-Z]{10,}\b/, // Unusually long uppercase sequences
        /\b\d{15,}\b/, // Unusually long number sequences
        /[aeiou]{4,}/i, // Repeated vowels (OCR artifacts)
        /[bcdfghjklmnpqrstvwxyz]{5,}/i // Too many consonants
      ]
    };
    
    // Authentic document indicators (positive signals)
    this.authenticPatterns = {
      officialLanguage: [
        /\b(DEPARTMENT OF|STATE OF|GOVERNMENT OF|ISSUED BY|AUTHORIZED BY)\b/i,
        /\b(UNDER PENALTY OF PERJURY|FEDERAL LAW|STATE LAW)\b/i,
        /\b(EXPIRES|EXPIRATION|VALID UNTIL|EFFECTIVE DATE)\b/i,
        /\b(LICENSE NUMBER|DOCUMENT NUMBER|IDENTIFICATION NUMBER)\b/i
      ],
      
      properFormatting: [
        /\b[A-Z]{2}\s+\d{5}(-\d{4})?\b/, // Proper US ZIP codes
        /\b\d{2}\/\d{2}\/\d{4}\b/, // Proper date formatting
        /\b[A-Z][a-z]+,\s+[A-Z]{2}\b/, // City, State format
        /\b\d{3}-\d{2}-\d{4}\b/ // Proper SSN format
      ],
      
      documentSpecific: {
        driverLicense: [
          /\b(CLASS|RESTRICTIONS|ENDORSEMENTS|CDL)\b/i,
          /\b(DONOR|VETERAN|MOTORCYCLE)\b/i,
          /\b(HEIGHT|WEIGHT|EYES|HAIR)\b/i
        ],
        passport: [
          /\b(PASSPORT|UNITED STATES|NATIONALITY|PLACE OF BIRTH)\b/i,
          /\b(TYPE|CODE|ISSUING AUTHORITY)\b/i
        ],
        idCard: [
          /\b(IDENTIFICATION|RESIDENT|CITIZEN|ALIEN)\b/i,
          /\b(ISSUED|EXPIRES|VALID)\b/i
        ]
      }
    };
  }

  /**
   * Analyze document text for fake indicators
   * @param {string} text - Extracted text from document
   * @param {string} documentType - Type of document
   * @returns {Object} Analysis result with confidence and details
   */
  analyzeForFakeIndicators(text, documentType = 'unknown') {
    try {
      if (!text || text.length < 10) {
        return {
          isFake: true,
          confidence: 0.9,
          reasons: ['Insufficient text content'],
          score: 0.1
        };
      }

      let fakeScore = 0;
      let authenticScore = 0;
      const reasons = [];
      const positiveSignals = [];

      // Check for fake patterns
      Object.entries(this.fakePatterns).forEach(([category, patterns]) => {
        patterns.forEach(pattern => {
          if (pattern.test(text)) {
            fakeScore += this.getPatternWeight(category);
            reasons.push(`Detected ${category.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
          }
        });
      });

      // Check for authentic patterns
      this.authenticPatterns.officialLanguage.forEach(pattern => {
        if (pattern.test(text)) {
          authenticScore += 0.15;
          positiveSignals.push('Official language detected');
        }
      });

      this.authenticPatterns.properFormatting.forEach(pattern => {
        if (pattern.test(text)) {
          authenticScore += 0.1;
          positiveSignals.push('Proper formatting detected');
        }
      });

      // Document-specific checks
      if (documentType !== 'unknown' && this.authenticPatterns.documentSpecific[documentType]) {
        this.authenticPatterns.documentSpecific[documentType].forEach(pattern => {
          if (pattern.test(text)) {
            authenticScore += 0.12;
            positiveSignals.push(`${documentType} specific content detected`);
          }
        });
      }

      // Additional quality checks
      const qualityAnalysis = this.analyzeTextQuality(text);
      fakeScore += qualityAnalysis.suspicionScore;
      authenticScore += qualityAnalysis.qualityScore;

      if (qualityAnalysis.issues.length > 0) {
        reasons.push(...qualityAnalysis.issues);
      }

      // Calculate final assessment
      const netScore = authenticScore - fakeScore;
      const confidence = Math.abs(netScore);
      const isFake = netScore < 0;
      const finalScore = Math.max(0, Math.min(1, 0.5 + netScore));

      console.log(`[FakeDetection] Analysis for ${documentType}:`, {
        textLength: text.length,
        fakeScore: fakeScore.toFixed(2),
        authenticScore: authenticScore.toFixed(2),
        netScore: netScore.toFixed(2),
        isFake,
        confidence: confidence.toFixed(2),
        finalScore: finalScore.toFixed(2)
      });

      return {
        isFake,
        confidence: Math.min(confidence, 0.95),
        score: finalScore,
        reasons,
        positiveSignals,
        details: {
          fakeScore,
          authenticScore,
          netScore,
          qualityAnalysis
        }
      };

    } catch (error) {
      console.error('[FakeDetection] Error analyzing document:', error.message);
      return {
        isFake: true,
        confidence: 0.8,
        reasons: ['Analysis error occurred'],
        score: 0.2
      };
    }
  }

  /**
   * Analyze text quality for OCR artifacts and inconsistencies
   * @param {string} text - Text to analyze
   * @returns {Object} Quality analysis result
   */
  analyzeTextQuality(text) {
    const issues = [];
    let suspicionScore = 0;
    let qualityScore = 0;

    // Check character distribution
    const charCounts = {
      letters: (text.match(/[a-zA-Z]/g) || []).length,
      numbers: (text.match(/\d/g) || []).length,
      spaces: (text.match(/\s/g) || []).length,
      special: (text.match(/[^\w\s]/g) || []).length
    };

    const totalChars = text.length;
    const letterRatio = charCounts.letters / totalChars;
    const numberRatio = charCounts.numbers / totalChars;
    const specialRatio = charCounts.special / totalChars;

    // Suspicious ratios
    if (letterRatio < 0.4) {
      suspicionScore += 0.2;
      issues.push('Unusually low letter ratio');
    }

    if (specialRatio > 0.3) {
      suspicionScore += 0.3;
      issues.push('Too many special characters');
    }

    if (numberRatio > 0.6) {
      suspicionScore += 0.2;
      issues.push('Unusually high number ratio');
    }

    // Check for repeated patterns (OCR artifacts)
    const repeatedPatterns = text.match(/(.{2,})\1{2,}/g);
    if (repeatedPatterns && repeatedPatterns.length > 2) {
      suspicionScore += 0.25;
      issues.push('Excessive repeated patterns detected');
    }

    // Check word structure
    const words = text.split(/\s+/).filter(word => word.length > 1);
    const validWords = words.filter(word => /^[A-Za-z0-9]+$/.test(word));
    const validWordRatio = validWords.length / Math.max(words.length, 1);

    if (validWordRatio > 0.7) {
      qualityScore += 0.15;
    } else if (validWordRatio < 0.4) {
      suspicionScore += 0.2;
      issues.push('Many garbled words detected');
    }

    // Check for proper sentence structure
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 5);
    if (sentences.length >= 2) {
      qualityScore += 0.1;
    }

    // Check capitalization patterns
    const properNouns = text.match(/\b[A-Z][a-z]{2,}/g) || [];
    if (properNouns.length >= 3) {
      qualityScore += 0.1;
    }

    return {
      suspicionScore: Math.min(suspicionScore, 1.0),
      qualityScore: Math.min(qualityScore, 1.0),
      issues,
      charCounts,
      ratios: { letterRatio, numberRatio, specialRatio },
      validWordRatio
    };
  }

  /**
   * Get weight for different pattern categories
   * @param {string} category - Pattern category
   * @returns {number} Weight value
   */
  getPatternWeight(category) {
    const weights = {
      fakePersonalInfo: 0.4,
      fakeDocumentKeywords: 0.5,
      suspiciousNumbers: 0.3,
      lowQualityText: 0.2
    };
    return weights[category] || 0.1;
  }

  /**
   * Quick check for obvious fake indicators
   * @param {string} text - Text to check
   * @returns {boolean} True if obviously fake
   */
  isObviouslyFake(text) {
    const obviousFakePatterns = [
      /\b(FAKE|FORGED|COUNTERFEIT|NOT VALID|VOID|SPECIMEN)\b/i,
      /\b(JOHN DOE|JANE DOE|TEST USER|SAMPLE)\b/i,
      /\b(123-45-6789|000-00-0000)\b/,
      /\b(123 MAIN ST|123 FAKE ST)\b/i
    ];

    return obviousFakePatterns.some(pattern => pattern.test(text));
  }
}

module.exports = new FakeDetectionService();
