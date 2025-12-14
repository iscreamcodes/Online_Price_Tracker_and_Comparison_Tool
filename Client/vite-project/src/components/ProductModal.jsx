// src/components/ProductModal.jsx
import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { productService } from '../api/productService';

export default function ProductModal({ isOpen, onClose, product, onSave, token }) {
  const [formData, setFormData] = useState({
    Product_Name: '',
    Product_Category: '',
    Product_Price: '',
    trackedStore: '',
    isTracked: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (product) {
      setFormData({
        Product_Name: product.Product_Name || '',
        Product_Category: product.Product_Category || '',
        Product_Price: product.Product_Price || '',
        trackedStore: product.trackedStore || '',
        isTracked: product.isTracked || false
      });
    } else {
      setFormData({
        Product_Name: '',
        Product_Category: '',
        Product_Price: '',
        trackedStore: '',
        isTracked: false
      });
    }
  }, [product]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let savedProduct;
      if (product) {
        // Update existing product
        const res = await productService.updateProduct(product._id, formData, token);
        savedProduct = res.data;
      } else {
        // Create new product
        const res = await productService.createProduct(formData, token);
        savedProduct = res.data;
      }
      onSave(savedProduct);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {product ? 'Edit Product' : 'Add New Product'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Product Name *
            </label>
            <input
              type="text"
              required
              value={formData.Product_Name}
              onChange={(e) => setFormData(prev => ({ ...prev, Product_Name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category *
            </label>
            <input
              type="text"
              required
              value={formData.Product_Category}
              onChange={(e) => setFormData(prev => ({ ...prev, Product_Category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.Product_Price}
              onChange={(e) => setFormData(prev => ({ ...prev, Product_Price: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Store
            </label>
            <input
              type="text"
              value={formData.trackedStore}
              onChange={(e) => setFormData(prev => ({ ...prev, trackedStore: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isTracked}
              onChange={(e) => setFormData(prev => ({ ...prev, isTracked: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 text-sm text-gray-700">
              Track this product
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Saving...' : (product ? 'Update' : 'Create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}