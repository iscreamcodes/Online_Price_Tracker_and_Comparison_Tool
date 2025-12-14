import HistoricalPrice from "../Model/History.js";

export async function addHistoricalPriceIfChanged({ History_listing_id, History_Price }) { // Changed from Listing_id
  console.log(`\n🕵️‍♂️ [HISTORY] Checking history for listing ${History_listing_id}`);

  try {
    // Ensure the price is properly cleaned and converted to number
    const cleanNewPrice = typeof History_Price === 'string' 
      ? Number(History_Price.replace(/[^\d.]/g, ""))
      : Number(History_Price);

    console.log(`🔢 [HISTORY] Cleaned price: ${cleanNewPrice}`);

    if (isNaN(cleanNewPrice) || cleanNewPrice <= 0) {
      console.log(`⚠️ [HISTORY] Invalid price ${History_Price} -> ${cleanNewPrice} for listing ${History_listing_id}`);
      return false;
    }

    const last = await HistoricalPrice.findOne({ History_listing_id }).sort({ History_createdAt: -1 }); // Changed fields

    if (last) {
      const lastPrice = Number(last.History_Price);
      
      if (Math.abs(lastPrice - cleanNewPrice) < 0.01) {
        return false;
      } else {
        console.log(`📈 [HISTORY] Price changed! ${lastPrice} → ${cleanNewPrice}`);
      }
    } else {
      // console.log(`🆕 [HISTORY] No previous history found - creating first record`);
    }

    const newHistory = await HistoricalPrice.create({
      History_listing_id, // Changed from Listing_id
      History_Price: cleanNewPrice,
    });

    return true;

  } catch (err) {
    console.error(`❌ [HISTORY] Error in addHistoricalPriceIfChanged for listing ${History_listing_id}:`, err);
    return false;
  }
}