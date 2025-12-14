// src/components/ProductCard.jsx
import { Eye, Edit, Trash2 } from 'lucide-react';

export default function ProductCard({ product, onView, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 truncate flex-1 mr-2">
          {product.Product_Name}
        </h3>
        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
          product.isTracked 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {product.isTracked ? 'Tracked' : 'Not Tracked'}
        </span>
      </div>
      
      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div><strong>Category:</strong> {product.Product_Category}</div>
        <div><strong>Store:</strong> {product.trackedStore || '—'}</div>
        {product.Product_Price && (
          <div><strong>Price:</strong> ${product.Product_Price}</div>
        )}
      </div>

      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">
          {product.updatedAt ? new Date(product.updatedAt).toLocaleDateString() : '—'}
        </span>
        <div className="flex space-x-1">
          <button
            onClick={() => onView(product)}
            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </button>
          <button
            onClick={() => onEdit(product)}
            className="p-1 text-gray-600 hover:bg-gray-50 rounded"
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(product)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}