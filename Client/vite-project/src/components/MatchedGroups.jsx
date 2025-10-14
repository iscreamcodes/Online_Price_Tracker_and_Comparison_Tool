import React, { useEffect, useState } from "react";

export default function MatchedGroups() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/all-stores?q=iphone");
        const json = await res.json();
        setData(json.groupedProducts || []);
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p className="text-center mt-10 text-lg">Loading products...</p>;

  return (
    <div className="p-6 grid gap-6">
      {data.map((group, idx) => (
        <div
          key={idx}
          className="bg-white rounded-2xl shadow-md p-4 border border-gray-100"
        >
          <h2 className="text-lg font-semibold mb-3 text-gray-800">
            {group.baseProduct.title}
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {group.products.map((p, i) => (
              <div
                key={i}
                className="relative bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <img
                  src={p.image || "/placeholder.jpg"}
                  alt={p.title}
                  className="w-full h-40 object-contain bg-white"
                />

                {/* Store tag */}
                <div className="absolute top-2 right-2 bg-indigo-600 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-md">
                  {p.store.toUpperCase()}
                </div>

                <div className="p-3">
                  <h3 className="text-sm font-medium text-gray-800 truncate">
                    {p.title}
                  </h3>
                  <p className="text-indigo-700 font-semibold mt-1">
                    Ksh {p.price?.toLocaleString() || "—"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {data.length === 0 && (
        <p className="text-center text-gray-500">No matched products found.</p>
      )}
    </div>
  );
}
