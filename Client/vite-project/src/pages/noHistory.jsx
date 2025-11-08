// src/pages/History.jsx
import { Eye, Clock } from "lucide-react";

export default function History() {
  return (
    <div className="text-center py-12">
      <Eye size={48} className="mx-auto text-gray-400 mb-4" />
      <h3 className="text-lg font-semibold text-gray-600 mb-2">Browsing History</h3>
      <p className="text-gray-500 max-w-md mx-auto mb-6">
        Your recently viewed products will appear here.
      </p>
      <div className="flex justify-center gap-4">
        <button className="bg-[#004d40] text-white px-4 py-2 rounded-lg hover:bg-green-900 transition">
          Clear History
        </button>
        <button className="border border-[#004d40] text-[#004d40] px-4 py-2 rounded-lg hover:bg-green-50 transition">
          Settings
        </button>
      </div>
    </div>
  );
}