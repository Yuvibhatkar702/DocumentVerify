# Document Verification System

A comprehensive document verification system built with React frontend, Node.js backend, and AI/ML microservice for automated document analysis and verification.

## Features

### Frontend (React)
- **User Authentication**: Secure login and registration
- **Document Upload**: Easy drag-and-drop file upload interface
- **Dashboard**: Real-time status tracking of document verification
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Live status updates for document processing

### Backend (Node.js/Express)
- **RESTful API**: Clean and well-documented API endpoints
- **Authentication & Authorization**: JWT-based secure authentication
- **File Management**: Secure file upload and storage
- **Database Integration**: MongoDB for data persistence
- **Logging & Monitoring**: Comprehensive logging system
- **Rate Limiting**: Protection against abuse

### AI/ML Service (Python/FastAPI)
- **OCR (Optical Character Recognition)**: Text extraction from documents
- **Signature Detection**: Automatic signature identification
- **Document Format Validation**: Structure and layout verification
- **Quality Assessment**: Image quality analysis
- **Anomaly Detection**: Identification of potential tampering

## Technology Stack

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Context API for state management

### Backend
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Multer for file uploads
- Bcrypt for password hashing

### AI/ML Service
- Python with FastAPI
- OpenCV for image processing
- Pytesseract for OCR
- NumPy and PIL for image manipulation
- Scikit-learn for machine learning features

## Project Structure

```
document-verification-system/
├── client/                         # React Frontend
│   ├── public/
│   └── src/
│       ├── components/              # Reusable React components
│       ├── pages/                   # React pages
│       ├── services/                # API calls
│       ├── contexts/                # React Context
│       └── utils/                   # Utility functions
├── server/                          # Node.js Backend
│   ├── config/                      # Configuration files
│   ├── controllers/                 # Business logic
│   ├── models/                      # Database models
│   ├── routes/                      # API routes
│   ├── middleware/                  # Custom middlewares
│   ├── services/                    # Service layer
│   └── utils/                       # Helper functions
├── ai-ml-service/                   # AI/ML Microservice
│   ├── models/                      # AI/ML models
│   ├── utils/                       # Processing utilities
│   ├── routes/                      # API routes
│   └── app.py                       # Service entry point
└── uploads/                         # File storage
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB
- Tesseract OCR

### Backend Setup
1. Navigate to the project root:
   ```bash
   cd document-verification-system
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start MongoDB service

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup
1. Navigate to client directory:
   ```bash
   cd client
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

### AI/ML Service Setup
1. Navigate to AI/ML service directory:
   ```bash
   cd ai-ml-service
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Install Tesseract OCR:
   - **Ubuntu/Debian**: `sudo apt-get install tesseract-ocr`
   - **macOS**: `brew install tesseract`
   - **Windows**: Download from [GitHub](https://github.com/UB-Mannheim/tesseract/wiki)

5. Start the AI/ML service:
   ```bash
   python app.py
   ```

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### Document Endpoints
- `POST /api/documents/upload` - Upload document
- `GET /api/documents` - Get user documents
- `GET /api/documents/:id` - Get specific document
- `POST /api/documents/:id/verify` - Manual verification (admin)
- `DELETE /api/documents/:id` - Delete document

### AI/ML Service Endpoints
- `POST /api/v1/analyze` - Comprehensive document analysis
- `POST /api/v1/ocr` - OCR text extraction
- `POST /api/v1/detect-signature` - Signature detection
- `POST /api/v1/validate-format` - Format validation

## Usage

1. **Register/Login**: Create an account or login to existing account
2. **Upload Document**: Use the upload interface to submit documents
3. **Track Progress**: Monitor verification status in the dashboard
4. **Review Results**: View detailed analysis results and confidence scores

## Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/document-verification-system
JWT_SECRET=your-jwt-secret
AI_ML_SERVICE_URL=http://localhost:8000
```

#### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- File type and size restrictions
- Rate limiting
- CORS protection
- Helmet security headers

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

## Roadmap

- [ ] Advanced ML models for document classification
- [ ] Multi-language OCR support
- [ ] Blockchain-based verification certificates
- [ ] Mobile application
- [ ] Advanced fraud detection
- [ ] Batch processing capabilities
- [ ] Integration with government databases
- [ ] Real-time collaboration features
