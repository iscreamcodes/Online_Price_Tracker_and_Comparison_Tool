export default function About() {
    return (
      <div className="bg-white min-h-screen px-6 md:px-20 py-12 font-poppins">
        <h1 className="text-3xl font-bold text-[#004d40] mb-4">About TrackIt</h1>
  
        <p className="text-gray-700 leading-relaxed mb-6">
          TrackIt is a price comparison and product tracking platform designed to help 
          shoppers make smarter purchasing decisions. We monitor prices across multiple 
          online stores and notify you when prices drop.
        </p>
  
        <h2 className="text-2xl font-semibold text-[#004d40] mt-8 mb-3">Our Mission</h2>
        <p className="text-gray-700 leading-relaxed mb-6">
          Our mission is to empower consumers with accurate, real-time information so 
          they can save money and avoid overpriced purchases.
        </p>
  
        <h2 className="text-2xl font-semibold text-[#004d40] mb-3">Why We Built TrackIt</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Online stores change prices frequently</li>
          <li>Shoppers often miss discounts</li>
          <li>Comparing prices manually is time-consuming</li>
          <li>People want automated alerts for price drops</li>
        </ul>
  
        <h2 className="text-2xl font-semibold text-[#004d40] mt-8 mb-3">How TrackIt Helps You</h2>
        <ul className="list-disc pl-6 text-gray-700 space-y-2">
          <li>Track prices from multiple e-commerce stores</li>
          <li>Receive instant alerts when prices drop</li>
          <li>View full price history for any item</li>
          <li>Find the best deals faster</li>
        </ul>
  
        <p className="mt-10 text-gray-600 italic">
          Your smart shopping assistant — always watching prices for you.
        </p>
      </div>
    );
  }
  