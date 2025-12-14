// src/components/BulkUploadModal.jsx
import { useState } from 'react';
import { X, Upload, Download } from 'lucide-react';
import { productService } from '../api/productService';

export default function BulkUploadModal({ isOpen, onClose, onUpload, token }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const jsonData = JSON.parse(event.target.result);
          const res = await productService.bulkUpload(jsonData, token);
          onUpload(res.data.products);
          onClose();
        } catch (parseError) {
          setError('Invalid JSON file format');
        }
      };
      reader.readAsText(file);
    } catch (err) {
      setError('Failed to upload file');
    } finally {
      setLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        "Product_Name": "Example Product",
        "Product_Category": "Electronics",
        "Product_Price": "299.99",
        "trackedStore": "Amazon",
        "isTracked": true
      }
    ];
    
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-template.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">Bulk Upload Products</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div className="text-center">
            <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Upload JSON File
            </h3>
            <p className="text-gray-500 mb-4">
              Upload a JSON file with product data. Download the template below for the correct format.
            </p>

            <div className="space-y-3">
              <label className="block">
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="hidden"
                />
                <div className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50">
                  {loading ? 'Uploading...' : 'Choose File'}
                </div>
              </label>

              <button
                onClick={downloadTemplate}
                className="flex items-center justify-center w-full text-blue-600 hover:text-blue-700"
              >
                <Download className="h-4 w-4 mr-2" />
                Download Template
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}