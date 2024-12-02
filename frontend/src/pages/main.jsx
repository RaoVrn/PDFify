import React, { useState } from 'react';
import axios from 'axios';
import './global.css';

function Main() {
  const [file, setFile] = useState(null);
  const [conversionType, setConversionType] = useState('');
  const [convertedFiles, setConvertedFiles] = useState([]);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleConversionTypeChange = (e) => {
    setConversionType(e.target.value);
  };

  const handleUpload = async () => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('File uploaded successfully');
    } catch (error) {
      alert('Error uploading file');
    }
  };

  const handleConvert = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/converted', {
        filename: file.name,
        conversion_type: conversionType,
      });
      setConvertedFiles(response.data.converted_files);
    } catch (error) {
      alert('Error converting file');
    }
  };

  const handleDownload = (file) => {
    window.open(`http://127.0.0.1:5000/download/${file.type}/${file.filename}`, '_blank');
  };

  return (
    <div className="container">
      <div className='header'>
        <h1>PDFify</h1>
        <h5>Your PDF Conversion Partner</h5>
      </div>

      <div className="content">
        <div className="section">
          <label className="label">Upload PDF File</label>
          <input
            type="file"
            onChange={handleFileChange}
            className="file-input"
          />
          <button
            onClick={handleUpload}
            className="upload-btn"
          >
            Upload File
          </button>
        </div>

        <div className="section">
          <label className="label">Select Conversion Type</label>
          <select
            onChange={handleConversionTypeChange}
            className="select-input"
          >
            <option value="">Select</option>
            <option value="text">Text</option>
            <option value="word">Word</option>
            <option value="image">Image</option>
          </select>
          <button
            onClick={handleConvert}
            className="convert-btn"
          >
            Convert
          </button>
        </div>

        {convertedFiles.length > 0 && (
          <div className="converted-files">
            <h2 className="converted-title">Converted Files:</h2>
            <div className="converted-list">
              {convertedFiles.map((file, index) => (
                <div key={index} className="converted-item">
                  <span className="file-info">{file.type} - {file.filename}</span>
                  <button
                    onClick={() => handleDownload(file)}
                    className="download-btn"
                  >
                    Download
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Main;
