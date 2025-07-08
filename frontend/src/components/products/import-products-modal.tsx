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
  const [imageDir, setImageDir] = useState<FileList | null>(null);
  const [currentStep, setCurrentStep] = useState<'upload' | 'preview' | 'importing'>('upload');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const imageDirInputRef = useRef<HTMLInputElement | null>(null);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<{created: any[], failed: any[]} | null>(null);

  useEffect(() => {
    if (imageDirInputRef.current) {
      // @ts-ignore
      imageDirInputRef.current.webkitdirectory = true;
    }
  }, []);

  // Helper: get image files from folder
  const getImageFiles = (files: FileList | null) => {
    if (!files) return [];
    const imageExts = ["jpg", "jpeg", "png", "webp"];
    return Array.from(files).filter(f => {
      const ext = f.name.split('.').pop()?.toLowerCase();
      return ext && imageExts.includes(ext);
    });
  };

  // CSV file input handler
  const handleCsvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Remove CSV file
  const removeCsv = () => setFile(null);

  // Remove image folder
  const removeImageDir = () => setImageDir(null);

  // Restore CSV import functionality
  const handleImport = async () => {
    if (!file) return;
    setIsUploading(true);
    setError(null);
    try {
      const result = await importProductsFromCsv(file);
      setImportResult(result);
      const created = result.created?.length || 0;
      const failed = result.failed?.length || 0;
      setNotificationMsg(`Imported ${created} product${created === 1 ? '' : 's'}${failed ? `, ${failed} failed` : ''}.`);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 5000);
      setIsUploading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during import');
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  const imageFiles = getImageFiles(imageDir);

  return (
    <div className="fixed inset-0 top-0 left-0 w-screen h-screen bg-black bg-opacity-50 flex items-center justify-center z-50 p-0">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-5xl w-full max-h-[90vh] flex flex-col overflow-y-auto">
        {/* Notification */}
        {showNotification && notificationMsg && (
          <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-100 text-green-800 px-6 py-3 rounded shadow flex items-center gap-2">
            <span className="material-icons">check_circle</span>
            <span>{notificationMsg}</span>
            <button className="ml-2 text-green-800 hover:text-green-900" onClick={() => setShowNotification(false)}>
              <span className="material-icons text-base">close</span>
            </button>
          </div>
        )}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Import Products</h3>
          <button 
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
            disabled={isUploading}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="flex flex-row gap-8 items-stretch mb-6">
          {/* CSV Upload */}
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-input rounded-lg p-6 min-h-[220px]">
            <label className="block font-medium mb-2">CSV File</label>
            {!file ? (
              <>
                <input
                  type="file"
                  accept=".csv"
                  id="csv-upload"
                  style={{ display: 'none' }}
                  onChange={handleCsvChange}
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-primary/10 border border-zinc-200 text-sm"
                  onClick={() => document.getElementById('csv-upload')?.click()}
                  disabled={isUploading}
                >
                  <span className="material-icons align-middle mr-1">upload_file</span>
                  Select CSV File
                </button>
                <p className="text-xs text-muted-foreground mt-2">Only one CSV file allowed. Required columns: type, name, price, etc.</p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="material-icons text-4xl text-primary">description</span>
                <span className="text-sm font-medium">{file.name}</span>
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline mt-1"
                  onClick={removeCsv}
                  disabled={isUploading}
                >Remove</button>
              </div>
            )}
          </div>
          {/* Plus icon */}
          <div className="flex flex-col justify-center items-center px-2">
            <span className="material-icons text-3xl text-muted-foreground">add</span>
          </div>
          {/* Image Folder Picker */}
          <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-input rounded-lg p-6 min-h-[220px]">
            <label className="block font-medium mb-2">Image Folder</label>
            {!imageDir ? (
              <>
                <input
                  type="file"
                  ref={imageDirInputRef}
                  multiple
                  style={{ display: 'none' }}
                  onChange={e => setImageDir(e.target.files)}
                  accept="image/jpeg,image/png,image/webp"
                />
                <button
                  type="button"
                  className="px-4 py-2 bg-muted text-muted-foreground rounded hover:bg-primary/10 border border-zinc-200 text-sm"
                  onClick={() => imageDirInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <span className="material-icons align-middle mr-1">folder_open</span>
                  Select Image Folder
                </button>
                <p className="text-xs text-muted-foreground mt-2">Choose a folder containing product images (jpg, jpeg, png, webp).</p>
              </>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <span className="material-icons text-4xl text-primary">folder</span>
                <span className="text-sm font-medium">{imageFiles.length} image file{imageFiles.length !== 1 ? 's' : ''} found</span>
                {imageFiles.length > 0 && (
                  <ul className="text-xs text-muted-foreground mt-1 max-h-16 overflow-y-auto">
                    {imageFiles.slice(0, 3).map((f, i) => (
                      <li key={i}>{f.name}</li>
                    ))}
                    {imageFiles.length > 3 && <li>...and {imageFiles.length - 3} more</li>}
                  </ul>
                )}
                <button
                  type="button"
                  className="text-xs text-red-600 hover:underline mt-1"
                  onClick={removeImageDir}
                  disabled={isUploading}
                >Remove</button>
              </div>
            )}
          </div>
        </div>
        {/* Import button */}
        <div className="flex justify-end mt-4">
          <button
            className="px-6 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-90 disabled:opacity-60"
            disabled={!file || isUploading}
            onClick={handleImport}
          >
            {isUploading ? 'Importing...' : 'Import'}
          </button>
        </div>
        {/* Show error if any */}
        {error && (
          <div className="mt-4 text-red-600 bg-red-50 p-3 rounded">{error}</div>
        )}
      </div>
    </div>
  );
}
