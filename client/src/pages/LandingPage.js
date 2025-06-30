import React, { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { Link as ScrollLink } from 'react-scroll';
import { FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const LandingPage = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: "home", label: "Home", icon: "🏠" },
    { to: "features", label: "Features", icon: "⭐" },
    { to: "how-it-works", label: "How It Works", icon: "⚙️" },
    { to: "technology", label: "Technology", icon: "🚀" },
    { to: "contact", label: "Contact", icon: "📞" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Navigation Header */}
      <nav className="fixed w-full top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🔐</div>
              <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                DocuVerify
              </h2>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <ScrollLink
                  key={link.to}
                  to={link.to}
                  spy={true}
                  smooth={true}
                  offset={-70}
                  duration={500}
                  className="flex items-center space-x-2 text-gray-700 hover:text-blue-600 transition-colors duration-200 group cursor-pointer"
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </ScrollLink>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="hidden md:flex items-center space-x-4">
              <RouterLink 
                to="/login" 
                className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 transition-colors duration-200"
              >
                <span className="text-lg">👤</span>
                <span className="font-medium">Login</span>
              </RouterLink>
              <RouterLink 
                to="/register" 
                className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
              >
                <span className="text-lg">🚀</span>
                <span className="font-medium">Get Started</span>
              </RouterLink>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="space-y-1">
                  <div className={`w-6 h-0.5 bg-current transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`}></div>
                  <div className={`w-6 h-0.5 bg-current transition-opacity duration-200 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                  <div className={`w-6 h-0.5 bg-current transition-transform duration-200 ${isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`}></div>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          <div className={`md:hidden transition-all duration-300 ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'}`}>
            <div className="py-4 space-y-4">
              {navLinks.map((link) => (
                <ScrollLink
                  key={link.to}
                  to={link.to}
                  spy={true}
                  smooth={true}
                  offset={-70}
                  duration={500}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center space-x-3 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200 cursor-pointer"
                >
                  <span className="text-lg">{link.icon}</span>
                  <span className="font-medium">{link.label}</span>
                </ScrollLink>
              ))}
              <div className="flex flex-col space-y-2 px-4 pt-4 border-t border-gray-200">
                <RouterLink 
                  to="/login" 
                  className="flex items-center justify-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  <span className="text-lg">👤</span>
                  <span className="font-medium">Login</span>
                </RouterLink>
                <RouterLink 
                  to="/register" 
                  className="flex items-center justify-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg"
                >
                  <span className="text-lg">🚀</span>
                  <span className="font-medium">Get Started</span>
                </RouterLink>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section id="home" className="pt-16 min-h-screen flex items-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="space-y-8">
              <div className="space-y-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Advanced Document
                  </span>
                  <br />
                  <span className="text-gray-900">Verification</span>
                  <br />
                  <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    Made Simple
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-xl">
                  Secure, AI-powered document verification system for passports, driver's licenses, 
                  and official documents. Built with cutting-edge technology for accuracy and reliability.
                </p>
              </div>

              {/* Hero Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <RouterLink 
                  to="/register" 
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <span className="mr-2">🚀</span>
                  Start Verifying Documents
                </RouterLink>
                <RouterLink 
                  to="/login" 
                  className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-xl hover:border-blue-500 hover:text-blue-600 transition-all duration-200 transform hover:scale-105 shadow-lg"
                >
                  <span className="mr-2">👤</span>
                  Sign In
                </RouterLink>
              </div>

              {/* Hero Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    99.9%
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Accuracy Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                    10,000+
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Documents Verified</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                    24/7
                  </div>
                  <p className="text-sm text-gray-600 font-medium">Available</p>
                </div>
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative">
              <div className="space-y-6">
                {/* Passport Document Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 transform rotate-3 hover:rotate-1 transition-transform duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <span className="flex items-center space-x-2 text-blue-600 font-semibold">
                      <span className="text-2xl">🛂</span>
                      <span>PASSPORT</span>
                    </span>
                    <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <span>✅</span>
                      <span>VERIFIED</span>
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Name:</span>
                      <span className="text-gray-900 font-semibold">John Doe</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Country:</span>
                      <span className="text-gray-900 font-semibold">United States</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Status:</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">Valid</span>
                    </div>
                  </div>
                </div>

                {/* Driver's License Document Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-6 transform -rotate-2 hover:rotate-0 transition-transform duration-300 ml-8">
                  <div className="flex justify-between items-center mb-4">
                    <span className="flex items-center space-x-2 text-purple-600 font-semibold">
                      <span className="text-2xl">🚗</span>
                      <span>DRIVER LICENSE</span>
                    </span>
                    <span className="flex items-center space-x-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                      <span>✅</span>
                      <span>VERIFIED</span>
                    </span>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Name:</span>
                      <span className="text-gray-900 font-semibold">Jane Smith</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">State:</span>
                      <span className="text-gray-900 font-semibold">California</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 font-medium">Status:</span>
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-semibold">Valid</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Why Choose <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">DocuVerify</span>?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Advanced AI-powered document verification with enterprise-grade security
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl mb-6">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">AI-Powered OCR</h3>
              <p className="text-gray-600 leading-relaxed">
                Advanced machine learning algorithms extract text with 99.9% accuracy from any document format.
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl mb-6">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Secure Processing</h3>
              <p className="text-gray-600 leading-relaxed">
                End-to-end encryption ensures your sensitive documents are protected throughout the verification process.
              </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl mb-6">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Real-time Verification</h3>
              <p className="text-gray-600 leading-relaxed">
                Get instant verification results with detailed analysis and confidence scores in seconds.
              </p>
            </div>

            <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl mb-6">📱</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Multiple Formats</h3>
              <p className="text-gray-600 leading-relaxed">
                Support for various document types including passports, licenses, certificates, and more.
              </p>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl mb-6">📊</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Detailed Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive verification reports with fraud detection and authenticity scores.
              </p>
            </div>

            <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-8 rounded-2xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105">
              <div className="text-6xl mb-6">🌐</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">API Integration</h3>
              <p className="text-gray-600 leading-relaxed">
                Easy-to-use REST API for seamless integration with your existing systems and workflows.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              How It <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Simple 3-step process to verify your documents
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-center justify-center space-y-8 lg:space-y-0 lg:space-x-8">
            <div className="flex flex-col items-center text-center max-w-sm">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg">
                1
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="text-4xl mb-4">📤</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Upload Document</h3>
                <p className="text-gray-600 leading-relaxed">
                  Securely upload your document image (JPG, PNG, PDF) through our encrypted platform.
                </p>
              </div>
            </div>

            <div className="hidden lg:block text-4xl text-blue-500">→</div>

            <div className="flex flex-col items-center text-center max-w-sm">
              <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg">
                2
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="text-4xl mb-4">🤖</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">AI Analysis</h3>
                <p className="text-gray-600 leading-relaxed">
                  Our advanced AI extracts and analyzes text, validates authenticity, and checks for tampering.
                </p>
              </div>
            </div>

            <div className="hidden lg:block text-4xl text-purple-500">→</div>

            <div className="flex flex-col items-center text-center max-w-sm">
              <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6 shadow-lg">
                3
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300">
                <div className="text-4xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Get Results</h3>
                <p className="text-gray-600 leading-relaxed">
                  Receive detailed verification report with confidence scores and authenticity assessment.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Stack Section */}
      <section id="technology" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Built with <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Cutting-Edge</span> Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powered by modern web technologies and AI frameworks
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4 text-center">⚛️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Frontend</h3>
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium w-full text-center">
                  React.js
                </span>
                <span className="inline-block px-3 py-1 bg-cyan-100 text-cyan-800 rounded-full text-sm font-medium w-full text-center">
                  Tailwind CSS
                </span>
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-800 rounded-full text-sm font-medium w-full text-center">
                  Responsive Design
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4 text-center">🖥️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Backend</h3>
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium w-full text-center">
                  Node.js
                </span>
                <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium w-full text-center">
                  Express.js
                </span>
                <span className="inline-block px-3 py-1 bg-teal-100 text-teal-800 rounded-full text-sm font-medium w-full text-center">
                  MongoDB
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4 text-center">🤖</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">AI/ML</h3>
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium w-full text-center">
                  Python
                </span>
                <span className="inline-block px-3 py-1 bg-pink-100 text-pink-800 rounded-full text-sm font-medium w-full text-center">
                  FastAPI
                </span>
                <span className="inline-block px-3 py-1 bg-rose-100 text-rose-800 rounded-full text-sm font-medium w-full text-center">
                  OpenCV
                </span>
                <span className="inline-block px-3 py-1 bg-fuchsia-100 text-fuchsia-800 rounded-full text-sm font-medium w-full text-center">
                  Tesseract OCR
                </span>
              </div>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="text-4xl mb-4 text-center">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 mb-4 text-center">Security</h3>
              <div className="space-y-3">
                <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium w-full text-center">
                  JWT Authentication
                </span>
                <span className="inline-block px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm font-medium w-full text-center">
                  Encryption
                </span>
                <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm font-medium w-full text-center">
                  Secure APIs
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Ready to Secure Your Document Verification?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who trust DocuVerify for accurate, secure document verification.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <RouterLink 
              to="/register" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-blue-600 bg-white rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <span className="mr-2">🚀</span>
              Get Started Free
            </RouterLink>
            <RouterLink 
              to="/login" 
              className="inline-flex items-center justify-center px-8 py-4 text-lg font-medium text-white border-2 border-white rounded-xl hover:bg-white hover:text-blue-600 transition-all duration-200 transform hover:scale-105"
            >
              <span className="mr-2">👤</span>
              Sign In
            </RouterLink>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">🔐</div>
                <h3 className="text-xl font-bold">DocuVerify</h3>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Advanced document verification system built for security and accuracy.
              </p>
              <div className="flex space-x-4">
                <button type="button" aria-label="Facebook" className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors cursor-pointer">
                  <FaFacebook />
                </button>
                <button type="button" aria-label="Twitter" className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white hover:bg-purple-700 transition-colors cursor-pointer">
                  <FaTwitter />
                </button>
                <button type="button" aria-label="Instagram" className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white hover:bg-pink-700 transition-colors cursor-pointer">
                  <FaInstagram />
                </button>
              </div>
            </div>

            {/* Product */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Product</h4>
              <ul className="space-y-2">
                <li>
                  <RouterLink to="/register" className="text-gray-400 hover:text-white transition-colors">
                    Get Started
                  </RouterLink>
                </li>
                <li>
                  <RouterLink to="/login" className="text-gray-400 hover:text-white transition-colors">
                    Sign In
                  </RouterLink>
                </li>
                <li>
                  <a href="#features" className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                    Features
                  </a>
                </li>
              </ul>
            </div>

            {/* Technology */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Technology</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <span>🤖</span>
                  <span>AI-Powered OCR</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📊</span>
                  <span>Document Analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>🛡️</span>
                  <span>Fraud Detection</span>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li className="flex items-center space-x-2">
                  <span>🎓</span>
                  <span>Final Year Project</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>💻</span>
                  <span>Computer Science</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span>📅</span>
                  <span>2025</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer Bottom */}
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400">
                &copy; 2025 DocuVerify. Final Year Project - Document Verification System.
              </p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <button type="button" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</button>
                <button type="button" className="text-gray-400 hover:text-white transition-colors">Terms of Service</button>
                <button type="button" className="text-gray-400 hover:text-white transition-colors">Support</button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
