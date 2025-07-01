from flask import Flask, request, jsonify
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)

@app.route('/analyze', methods=['POST'])
def analyze_document():
    try:
        print("Received analyze request")
        
        if 'file' not in request.files:
            print("No file in request")
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['file']
        document_type = request.form.get('documentType', 'other')
        
        print(f"Processing file: {file.filename}, type: {document_type}")
        
        # Simulate successful AI analysis
        analysis_result = {
            'confidence': 87.3,
            'status': 'verified',
            'extracted_text': f'Document analysis complete for {file.filename}',
            'security_features': ['digital_signature', 'watermark_detected', 'tamper_proof'],
            'anomalies': [],
            'document_type': document_type,
            'processing_time': 1.8,
            'file_size': len(file.read()),
            'verification_details': {
                'structure_valid': True,
                'content_readable': True,
                'security_level': 'high'
            }
        }
        
        print(f"Analysis complete: {analysis_result['status']}")
        return jsonify(analysis_result)
    
    except Exception as e:
        print(f"Error in analysis: {str(e)}")
        return jsonify({'error': str(e), 'status': 'failed'}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy', 'message': 'AI Service is running on port 8000'})

@app.route('/', methods=['GET'])
def home():
    return jsonify({'message': 'Document Verification AI Service', 'endpoints': ['/analyze', '/health']})

if __name__ == '__main__':
    print("=" * 50)
    print("🚀 Starting Document Verification AI Service")
    print("📡 Server: http://localhost:8000")
    print("🔍 Analyze endpoint: http://localhost:8000/analyze")
    print("❤️  Health check: http://localhost:8000/health")
    print("=" * 50)
    app.run(host='0.0.0.0', port=8000, debug=True)