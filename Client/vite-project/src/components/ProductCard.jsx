export default function ProductCard({ product }) {
  // Determine tag color based on store
  const getTagColor = (store) => {
    const storeLower = store.toLowerCase();
    if (storeLower.includes('jumia')) return 'bg-orange-500 text-white';
    if (storeLower.includes('kilimall')) return 'bg-red-500 text-white';
    if (storeLower.includes('amazon')) return 'bg-black text-orange-500';
    return 'bg-gray-500 text-white'; // default color
  };

  const tagColor = getTagColor(product.store);

  return (
    <div className="bg-gray-100 rounded-xl p-4 flex flex-col items-center hover:shadow-lg transition relative">
      {/* Store tag */}
      <div className={`absolute top-2 right-2 ${tagColor} text-xs font-semibold px-2 py-1 rounded-full`}>
        {product.store}
      </div>
      
      <img
        src={product.image}
        alt={product.name}
        className="w-32 h-32 object-contain mb-3 rounded-lg"
      />
      <h3 className="text-sm font-semibold text-gray-800 text-center">
        {product.name.length > 60
          ? product.name.slice(0, 60) + "..."
          : product.name}
      </h3>
      <p className="text-blue-600 font-bold mt-1">
        {product.currency} {product.price.toLocaleString()}
      </p>
      <a
        href={product.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-2 text-xs text-blue-500 hover:underline"
      >
        View Product
      </a>
    </div>
  );
}