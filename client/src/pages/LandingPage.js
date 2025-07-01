// Animated, Unique Landing Page – Orbit Layout, Animated Backgrounds, Neon Glow Effects
// Dependencies: framer-motion, tailwindcss (already assumed)

import React from 'react';
import { motion } from 'framer-motion';
import { Link as RouterLink } from 'react-router-dom';
import { FaFacebookF, FaTwitter, FaInstagram } from 'react-icons/fa';

const featureList = [
  { icon: '🧠', title: 'AI Intelligence', desc: 'Machine learning for document analysis' },
  { icon: '🔒', title: 'Secure Vault', desc: 'End-to-end encrypted uploads' },
  { icon: '⚡', title: 'Lightning Fast', desc: 'Instant verification feedback' },
  { icon: '🌐', title: 'API Ready', desc: 'Seamless third-party integration' }
];

const LandingPage = () => {
  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-[#0f0c29] via-[#302b63] to-[#24243e] text-white relative overflow-hidden">
      {/* Animated Blobs */}
      <div className="absolute top-0 -left-10 w-[600px] h-[600px] sm:w-[800px] sm:h-[800px] bg-pink-500 opacity-20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-0 -right-10 w-[500px] h-[500px] sm:w-[600px] sm:h-[600px] bg-blue-500 opacity-20 rounded-full blur-2xl animate-ping" />

      {/* Header */}
      <header className="w-full z-50 px-6 py-4 flex justify-between items-center relative">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">🔐 DocuVerify</h1>
        <nav className="flex space-x-6 text-sm font-medium">
          <RouterLink to="/login" className="hover:text-blue-400 transition">Login</RouterLink>
          <RouterLink to="/register" className="bg-white text-black px-4 py-2 rounded-xl hover:bg-gray-200 transition shadow-lg">Get Started</RouterLink>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="flex flex-col items-center justify-center text-center pt-32 pb-20 relative z-10">
        <motion.h2 
          initial={{ opacity: 0, y: -40 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1 }} 
          className="text-5xl font-extrabold leading-tight"
        >
          Next-Gen Document Verification
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.3, duration: 1 }} 
          className="mt-4 max-w-xl text-lg text-gray-300"
        >
          Automate and secure your document validation pipeline using AI and encryption.
        </motion.p>
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.6 }} 
          className="mt-8 flex gap-4"
        >
          <RouterLink to="/register" className="px-6 py-3 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition transform hover:scale-105 shadow-xl">Get Started</RouterLink>
          <RouterLink to="/login" className="px-6 py-3 border border-white text-white rounded-lg hover:bg-white hover:text-black transition transform hover:scale-105">Login</RouterLink>
        </motion.div>
      </section>

      {/* Orbit Feature Cards */}
      <section className="relative w-full h-[500px] flex items-center justify-center">
        <div className="relative w-full max-w-[400px] aspect-square">
          {featureList.map((f, i) => {
            const angle = (360 / featureList.length) * i;
            const x = 130 * Math.cos((angle * Math.PI) / 180);
            const y = 130 * Math.sin((angle * Math.PI) / 180);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 + i * 0.2 }}
                className="absolute w-[150px] h-[150px] p-4 bg-white/10 border border-white/20 rounded-2xl text-center backdrop-blur-md"
                style={{ left: `calc(50% + ${x}px - 75px)`, top: `calc(50% + ${y}px - 75px)` }}
              >
                <div className="text-3xl mb-2">{f.icon}</div>
                <h4 className="font-semibold text-sm mb-1">{f.title}</h4>
                <p className="text-xs text-gray-300">{f.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Testimonial */}
      <section className="py-20 text-center">
        <motion.blockquote
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="text-lg italic text-gray-300"
        >
          "We reduced document fraud by 97% using DocuVerify. Seamless, scalable, secure."
        </motion.blockquote>
        <p className="mt-2 font-semibold text-white">— Project Supervisor</p>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1a2e] text-gray-400 text-sm py-10 mt-16">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
          <div>
            <h4 className="text-white font-bold mb-2">DocuVerify</h4>
            <p>Revolutionizing document security and verification.</p>
            <div className="flex space-x-3 mt-3">
              <FaFacebookF className="hover:text-blue-400 cursor-pointer" />
              <FaTwitter className="hover:text-blue-400 cursor-pointer" />
              <FaInstagram className="hover:text-pink-400 cursor-pointer" />
            </div>
          </div>
          <div>
            <h4 className="text-white font-bold mb-2">Product</h4>
            <ul className="space-y-1">
              <li><RouterLink to="/register">Register</RouterLink></li>
              <li><RouterLink to="/login">Login</RouterLink></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-2">Technology</h4>
            <ul className="space-y-1">
              <li>OCR & AI</li>
              <li>Secure APIs</li>
              <li>Realtime Scoring</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold mb-2">Info</h4>
            <ul className="space-y-1">
              <li>Final Year Project</li>
              <li>Computer Science</li>
              <li>2025</li>
            </ul>
          </div>
        </div>
        <div className="text-center text-xs mt-8 text-gray-600">© 2025 DocuVerify. All rights reserved.</div>
      </footer>
    </div>
  );
};

export default LandingPage;
