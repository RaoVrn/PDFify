import React, { useState } from 'react';
import axios from 'axios';

function App() {
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
    console.log("Uploading file:", file);  //debug kar
    try {
      const response = await axios.post('http://127.0.0.1:5000/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      console.log(response.data);  //debug kar
      alert('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Error uploading file');
    }
  };

  const handleConvert = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/converted', {
        filename: file.name,
        conversion_type: conversionType,
      });
      console.log(response.data); //debug kar
      setConvertedFiles(response.data.converted_files);
    } catch (error) {
      console.error('Error converting file:', error);
      alert('Error converting file');
    }
  };

  const handleDownload = (file) => {
    window.open(`http://127.0.0.1:5000/download/${file.type}/${file.filename}`, '_blank');
  };

  return (
    <div className="App">
      <h1>PDF Converter</h1>
      <input type="file" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload File</button>

      <div>
        <label>Select Conversion Type:</label>
        <select onChange={handleConversionTypeChange}>
          <option value="">Select</option>
          <option value="text">Text</option>
          <option value="word">Word</option>
          <option value="image">Image</option>
        </select>
        <button onClick={handleConvert}>Convert</button>
      </div>

      <div>
        {convertedFiles.length > 0 && (
          <div>
            <h2>Converted Files:</h2>
            {convertedFiles.map((file, index) => (
              <div key={index}>
                {file.type === 'text' ? (
                  <textarea value={file.content} readOnly />
                ) : (
                  <button onClick={() => handleDownload(file)}>
                    Download {file.type}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
