"use client";

import { useState, useRef, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { CSVPreview } from "./csv-preview";
import { parseCsvFile } from "@/lib/csv-parser";
import { importProductsFromCsv } from "@/services/product-service";

interface ImportProductsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Tooltip component for image naming scheme
function ImageNamingTooltip() {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-block align-middle">
      <button
        type="button"
        className="ml-1 text-xs text-muted-foreground hover:text-primary focus:outline-none"
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        onFocus={() => setShow(true)}
        onBlur={() => setShow(false)}
        tabIndex={0}
      >
        <span className="material-icons text-base align-middle">info</span>
      </button>
      {show && (
        <div className="absolute z-50 left-1/2 -translate-x-1/2 mt-2 w-64 bg-card text-card-foreground border border-zinc-200 rounded shadow-lg p-3 text-xs">
          <b>Image Naming Scheme:</b><br />
          Main image: <code>sku.image_format</code> <br />
          Next images: <code>sku_1.image_format</code>, <code>sku_2.image_format</code>, ...<br />
          Supported formats: <b>.jpg</b>, <b>.jpeg</b>, <b>.png</b>, <b>.webp</b><br />
          <br />
          <b>Example:</b><br />
          <code>TS-001.jpg</code> (main image for TS-001)<br />
          <code>TS-001_1.jpg</code> (second image for TS-001)<br />
          <code>TS-001_2.png</code> (third image for TS-001, PNG format)
        </div>
      )}
    </span>
  );
}

export function ImportProductsModal({ isOpen, onClose }: ImportProductsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [csvData, setCsvData] = useState<any[] | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [imageDir, setImageDir] = useState<FileList | null>(null);
  const [importResult, setImportResult] = useState<{created: any[], failed: any[]} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const imageDirInputRef = useRef<HTMLInputElement | null>(null);
  
  useEffect(() => {
    if (imageDirInputRef.current) {
      // @ts-ignore
      imageDirInputRef.current.webkitdirectory = true;
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    maxFiles: 1,
    onDrop: async (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        const csvFile = acceptedFiles[0];
        setFile(csvFile);
        
        // Parse the CSV file
        try {
          const data = await parseCsvFile(csvFile);
          setCsvData(data);
          setCurrentStep('preview');
        } catch (error) {
          console.error("Error parsing CSV file:", error);
          // Handle error
        }
      }
    },
  });

  const handleImport = async () => {
    if (!file) return;
    
    setCurrentStep('importing');
    setIsUploading(true);
    setError(null);
    
    try {
      // Reset progress
      setUploadProgress(0);
      
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 5;
        });
      }, 300);
      
      // Perform the actual API call to import products
      const result = await importProductsFromCsv(file);
      
      // Mark as complete
      clearInterval(progressInterval);
      setUploadProgress(100);
      setImportResult(result);
      
      // Wait a bit before closing or showing results
      setTimeout(() => {
        // If there are errors, stay on the importing screen but show the error details
        if (result.failed && result.failed.length > 0) {
          setError(`Import completed with ${result.failed.length} errors.`);
        } else {
          // On success, close the modal
          setIsUploading(false);
          setFile(null);
          setCsvData(null);
          setUploadProgress(0);
          setCurrentStep('upload');
          onClose();
        }
      }, 500);
    } catch (err) {
      // Handle errors
      setError(err instanceof Error ? err.message : 'An unknown error occurred during import');
      setUploadProgress(0);
    }
  };
  
  const handleBack = () => {
    setCurrentStep('upload');
    setCsvData(null);
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-0">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] flex flex-col overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">
            {currentStep === 'upload' && 'Import Products from CSV'}
            {currentStep === 'preview' && 'Preview Products from CSV'}
            {currentStep === 'importing' && 'Importing Products...'}
          </h3>
          <button 
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
            disabled={isUploading}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {currentStep === 'upload' && (
            <>
              <div className="mb-4">
                <div 
                  {...getRootProps()} 
                  className={`border-2 border-dashed ${isDragActive ? 'border-primary' : 'border-input'} rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors`}
                >
                  <input {...getInputProps()} />
                  <span className="material-icons text-4xl mb-2 text-muted-foreground">upload_file</span>
                  <p className="text-muted-foreground">
                    {isDragActive ? 
                      'Drop the CSV file here' : 
                      'Drag & drop your CSV file here or click to browse'
                    }
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Make sure your CSV has the required columns: type, name, price, etc.
                  </p>
                </div>
              </div>
              {/* Image directory picker and naming scheme */}
              <div className="mb-4">
                <label className="block font-medium mb-1 flex items-center gap-2">
                  Product Images (optional)
                  <ImageNamingTooltip />
                </label>
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="file"
                    ref={imageDirInputRef}
                    multiple
                    style={{ display: 'none' }}
                    onChange={e => setImageDir(e.target.files)}
                  />
                  <button
                    type="button"
                    className="px-3 py-1 bg-muted text-muted-foreground rounded hover:bg-primary/10 border border-zinc-200 text-xs"
                    onClick={() => imageDirInputRef.current?.click()}
                  >
                    Browse
                  </button>
                  <span className="text-xs text-muted-foreground">
                    {imageDir && imageDir.length > 0 ? `${imageDir.length} files selected` : 'No directory selected'}
                  </span>
                </div>
                <div className="mb-2 p-2 bg-amber-100 text-amber-800 rounded text-xs">
                  <b>Note:</b> Using an image directory will <b>overwrite</b> any image URL fields in the CSV for matching products.
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-2">CSV Format Requirements</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                  <li>First row should contain column headers</li>
                  <li>Required columns: type, name, description, regular_price</li>
                  <li>For variations: use 'variable' and 'variation' types</li>
                  <li>Product images can be specified as URLs</li>
                </ul>
              </div>
            </>
          )}
          
          {currentStep === 'preview' && csvData && (
            <CSVPreview data={csvData} fileName={file?.name || ''} />
          )}
          
          {currentStep === 'importing' && (
            <div className="py-4">
              <div className="flex items-center mb-4">
                <span className="material-icons mr-2 text-green-500">description</span>
                <span className="font-medium">{file?.name}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  ({(file?.size || 0) / 1024 < 1024 
                    ? `${((file?.size || 0) / 1024).toFixed(2)} KB` 
                    : `${((file?.size || 0) / 1024 / 1024).toFixed(2)} MB`})
                </span>
              </div>
              
              <div className="mb-6">
                <div className="flex justify-between text-xs mb-1">
                  <span>Uploading...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
              
              {error && (
                <div className="text-sm text-red-500 bg-red-50 p-4 rounded-md mb-4">
                  <p className="flex items-center">
                    <span className="material-icons text-red-500 mr-2">error</span>
                    {error}
                  </p>
                  
                  {importResult && importResult.failed && importResult.failed.length > 0 && (
                    <div className="mt-3 max-h-40 overflow-y-auto bg-white p-2 rounded border border-red-200">
                      <h4 className="font-medium mb-2">Failed items:</h4>
                      <ul className="list-disc list-inside">
                        {importResult.failed.map((item, index) => (
                          <li key={index} className="text-xs">{`Row ${item.row}: ${item.error}`}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              
              {importResult && importResult.created && importResult.created.length > 0 && !error && (
                <div className="text-sm text-green-600 bg-green-50 p-4 rounded-md">
                  <p className="flex items-center">
                    <span className="material-icons text-green-500 mr-2">check_circle</span>
                    Successfully imported {importResult.created.length} products.
                  </p>
                </div>
              )}
              
              <div className="text-sm text-muted-foreground bg-muted/30 p-4 rounded-md mt-4">
                <p className="flex items-center">
                  <span className="material-icons text-amber-500 mr-2">info</span>
                  This may take a few minutes depending on the number of products.
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end space-x-2 mt-6 pt-4 border-t border-zinc-200">
          {currentStep === 'preview' && (
            <button 
              className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80"
              onClick={handleBack}
            >
              Back
            </button>
          )}
          
          <button 
            className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80"
            onClick={onClose}
            disabled={isUploading}
          >
            Cancel
          </button>
          
          {currentStep === 'preview' && (
            <button 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80 flex items-center"
              onClick={handleImport}
            >
              Import Products
              <span className="material-icons text-sm ml-1">file_upload</span>
            </button>
          )}

          {currentStep === 'importing' && error && (
            <button 
              className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80"
              onClick={() => {
                setCurrentStep('upload');
                setIsUploading(false);
                setError(null);
              }}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
