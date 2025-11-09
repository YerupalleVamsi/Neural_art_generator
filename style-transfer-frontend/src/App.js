// frontend/style-transfer-frontend/src/App.js
import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import './App.css';

function App() {
  const [contentImage, setContentImage] = useState(null);
  const [styleImage, setStyleImage] = useState(null);
  const [outputImage, setOutputImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const contentRef = useRef();
  const styleRef = useRef();

  const handleFiles = (file, type) => {
    if (type === 'content') setContentImage(file);
    if (type === 'style') setStyleImage(file);
  };

  const handleGenerate = async () => {
    if (!contentImage || !styleImage) return alert('Upload both images!');
    setLoading(true);

    const formData = new FormData();
    formData.append('content', contentImage);
    formData.append('style', styleImage);
    formData.append('image_size', 512);

    try {
      const API_URL = process.env.REACT_APP_API_URL;
      const res = await axios.post(`${API_URL}/generate`, formData);
      setOutputImage(res.data.stylized_image);
    } catch (err) {
      console.error(err);
      alert('Error generating image');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = (e, type) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    handleFiles(file, type);
  };

  const preventDefault = (e) => e.preventDefault();

  return (
    <div className="App">
      <motion.h1
        className="title"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        Neural Style Transfer
      </motion.h1>

      <motion.div
        className="upload-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
      >
        {/* Content Upload */}
        <div
          className="drop-zone"
          onDrop={(e) => handleDrop(e, 'content')}
          onDragOver={preventDefault}
          onClick={() => contentRef.current.click()}
        >
          {contentImage ? contentImage.name : 'Drop Content Image or Click to Upload'}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={contentRef}
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files[0], 'content')}
        />

        {/* Style Upload */}
        <div
          className="drop-zone"
          onDrop={(e) => handleDrop(e, 'style')}
          onDragOver={preventDefault}
          onClick={() => styleRef.current.click()}
        >
          {styleImage ? styleImage.name : 'Drop Style Image or Click to Upload'}
        </div>
        <input
          type="file"
          accept="image/*"
          ref={styleRef}
          style={{ display: 'none' }}
          onChange={(e) => handleFiles(e.target.files[0], 'style')}
        />

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleGenerate}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate'}
        </motion.button>
      </motion.div>

      {outputImage && (
        <motion.div
          className="output-container"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <h2>Result</h2>
          <img src={outputImage} alt="Stylized" className="output-image" />
        </motion.div>
      )}
    </div>
  );
}

export default App;
