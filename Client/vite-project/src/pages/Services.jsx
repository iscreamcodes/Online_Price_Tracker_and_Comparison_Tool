export default function Services() {
    return (
      <div className="px-6 md:px-20 py-12 font-poppins">
        <h1 className="text-3xl font-bold text-[#004d40] mb-8">Our Services</h1>
  
        {/* Service Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* 1. Price Comparison */}
          <div className="p-6 bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-[#004d40] mb-2">Price Comparison</h2>
            <p className="text-gray-700">
              Instantly compare prices of a product across multiple online markets 
              and find the store offering the best price.
            </p>
          </div>
  
          {/* 2. Price Tracking */}
          <div className="p-6 bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-[#004d40] mb-2">Price Tracking</h2>
            <p className="text-gray-700">
              Track any product and get notified when the price drops below your 
              desired threshold.
            </p>
          </div>
  
          {/* 3. Price History Analysis */}
          <div className="p-6 bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-[#004d40] mb-2">Price History</h2>
            <p className="text-gray-700">
              View historical price charts to understand trends and make better 
              buying decisions.
            </p>
          </div>
  
          {/* 4. Browser Monitoring */}
          <div className="p-6 bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-[#004d40] mb-2">Automated Monitoring</h2>
            <p className="text-gray-700">
              Our system checks prices daily and keeps you updated with consistent 
              tracking and notifications.
            </p>
          </div>
  
          {/* 5. Deal Alerts */}
          <div className="p-6 bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-[#004d40] mb-2">Deal Alerts</h2>
            <p className="text-gray-700">
              Receive instant alerts when your saved item gets discounted or a 
              better deal is found elsewhere.
            </p>
          </div>
  
          {/* 6. Multi-store Aggregation */}
          <div className="p-6 bg-white shadow-md rounded-xl border border-gray-200 hover:shadow-lg transition">
            <h2 className="text-xl font-semibold text-[#004d40] mb-2">Multi-Store Aggregation</h2>
            <p className="text-gray-700">
              We gather data from popular retailers to ensure you always see the 
              most accurate and up-to-date prices.
            </p>
          </div>
  
        </div>
      </div>
    );
  }
  