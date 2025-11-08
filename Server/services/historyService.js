import HistoricalPrice from "../Model/History.js";

export async function addHistoricalPriceIfChanged({ Listing_id, History_Price }) {
  console.log(`\n🕵️‍♂️ [HISTORY] Checking history for listing ${Listing_id}`);
 // console.log(`➡️ [HISTORY] New price to save: ${History_Price}`);

  try {
    // Ensure the price is properly cleaned and converted to number
    const cleanNewPrice = typeof History_Price === 'string' 
      ? Number(History_Price.replace(/[^\d.]/g, ""))
      : Number(History_Price);

    console.log(`🔢 [HISTORY] Cleaned price: ${cleanNewPrice}`);

    if (isNaN(cleanNewPrice) || cleanNewPrice <= 0) {
      console.log(`⚠️ [HISTORY] Invalid price ${History_Price} -> ${cleanNewPrice} for listing ${Listing_id}`);
      return false;
    }

    const last = await HistoricalPrice.findOne({ Listing_id }).sort({ createdAt: -1 });
    //console.log(`📜 [HISTORY] Last history record:`, last ? `${last.History_Price} (${last.createdAt})` : "none");

    if (last) {
      const lastPrice = Number(last.History_Price);
    //  console.log(`🔍 [HISTORY] Comparing: last price ${lastPrice} vs new price ${cleanNewPrice}`);
    //  console.log(`🔍 [HISTORY] Difference: ${Math.abs(lastPrice - cleanNewPrice)}`);
      
      if (Math.abs(lastPrice - cleanNewPrice) < 0.01) {
      //  console.log(`⏸️ [HISTORY] Price unchanged (${lastPrice} == ${cleanNewPrice}) — skipping save.`);
        return false;
      } else {
        console.log(`📈 [HISTORY] Price changed! ${lastPrice} → ${cleanNewPrice}`);
      }
    } else {
    //  console.log(`🆕 [HISTORY] No previous history found - creating first record`);
    }

    const newHistory = await HistoricalPrice.create({
      Listing_id,
      History_Price: cleanNewPrice,
    });

   // console.log(`✅ [HISTORY] New history record saved for listing ${Listing_id}: ${cleanNewPrice} (ID: ${newHistory._id})`);
    return true;

  } catch (err) {
    console.error(`❌ [HISTORY] Error in addHistoricalPriceIfChanged for listing ${Listing_id}:`, err);
    return false;
  }
}
