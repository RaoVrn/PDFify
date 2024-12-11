import React, { useState } from 'react';
import axios from 'axios';
import './global.css';

function Main() {
  const [file, setFile] = useState(null);
  const [conversionType, setConversionType] = useState('');
  const [convertedFiles, setConvertedFiles] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedTypes = ['application/pdf'];
      if (!allowedTypes.includes(selectedFile.type)) {
        setErrorMessage('Only PDF files are allowed.');
        setFile(null);
        return;
      }
      setErrorMessage('');
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile)); // Set the preview URL
    }
  };

  const handleConversionTypeChange = (e) => {
    setConversionType(e.target.value);
    setErrorMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file before uploading.');
      return;
    }
    setErrorMessage('');
    const formData = new FormData();
    formData.append('file', file);
    try {
      await axios.post('http://127.0.0.1:5000/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      alert('File uploaded successfully');
    } catch (error) {
      setErrorMessage('Error uploading file. Please try again.');
    }
  };

  const handleConvert = async () => {
    if (!file) {
      setErrorMessage('Please upload a file before converting.');
      return;
    }
    if (!conversionType) {
      setErrorMessage('Please select a conversion type.');
      return;
    }
    setErrorMessage('');
    try {
      const response = await axios.post('http://127.0.0.1:5000/converted', {
        filename: file.name,
        conversion_type: conversionType,
      });
      setConvertedFiles(response.data.converted_files);
    } catch (error) {
      setErrorMessage('Error converting file. Please try again.');
    }
  };

  const handleDownload = (file) => {
    try {
      window.open(`http://127.0.0.1:5000/download/${file.type}/${file.filename}`, '_blank');
    } catch (error) {
      setErrorMessage('Error downloading file. Please try again.');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>PDFify</h1>
        <h5>Your PDF Conversion Partner</h5>
      </div>

      <div className="content">
        {errorMessage && <div className="error-message">{errorMessage}</div>}

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

        {file && (
          <div className="section">
            <button
              onClick={() => window.open(previewUrl, '_blank')}
              className="preview-btn"
            >
              Preview File
            </button>
          </div>
        )}

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
            <option value="excel">Excel</option>
            <option value="ppt">PowerPoint</option>
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
