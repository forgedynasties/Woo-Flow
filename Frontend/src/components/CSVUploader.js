import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import './CSVUploader.css';

const CSVUploader = ({ onFileUpload, isLoading }) => {
  const onDrop = useCallback(acceptedFiles => {
    if (acceptedFiles.length > 0) {
      onFileUpload(acceptedFiles[0]);
    }
  }, [onFileUpload]);
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    disabled: isLoading,
    maxFiles: 1
  });

  return (
    <div 
      {...getRootProps()} 
      className={`csv-uploader ${isDragActive ? 'active' : ''} ${isLoading ? 'disabled' : ''}`}
    >
      <input {...getInputProps()} />
      
      {isLoading ? (
        <div className="uploader-content">
          <div className="spinner"></div>
          <p>Processing file...</p>
        </div>
      ) : (
        <div className="uploader-content">
          <span className="material-icons upload-icon">upload_file</span>
          
          <p>
            {isDragActive
              ? "Drop the CSV file here..."
              : "Drag & drop a CSV file here, or click to select"}
          </p>
          <span className="helper-text">Only CSV files are supported</span>
        </div>
      )}
    </div>
  );
};

export default CSVUploader;


