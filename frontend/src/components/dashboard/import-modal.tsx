"use client";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ImportModal({ isOpen, onClose }: ImportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-card text-card-foreground p-6 rounded-lg shadow-lg max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Import Products from CSV</h3>
          <button 
            className="text-muted-foreground hover:text-foreground"
            onClick={onClose}
          >
            <span className="material-icons">close</span>
          </button>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select CSV File</label>
          <div className="border-2 border-dashed border-input rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors">
            <span className="material-icons text-4xl mb-2">upload_file</span>
            <p className="text-muted-foreground">Drag & drop your CSV file here or click to browse</p>
            <input type="file" className="hidden" accept=".csv" />
          </div>
        </div>
        <div className="flex justify-end space-x-2">
          <button 
            className="px-4 py-2 bg-muted text-muted-foreground rounded-md hover:bg-opacity-80"
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-opacity-80">
            Import
          </button>
        </div>
      </div>
    </div>
  );
}
