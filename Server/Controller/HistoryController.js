import HistoricalPrice from "../Model/History.js";

// Save a new historical price
export const saveHistoricalPrice = async (req, res) => {
  try {
    const { Listing_id, History_Price } = req.body;

    if (!Listing_id || !History_Price)
      return res.status(400).json({ message: "Missing required fields" });

    const newRecord = new HistoricalPrice({ Listing_id, History_Price });
    await newRecord.save(); // ✅ createdAt auto-populated

    res.status(201).json({ message: "Historical price saved", data: newRecord });
  } catch (err) {
    console.error("Error saving history:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Fetch history for a specific listing
export const getHistoryByListing = async (req, res) => {
  try {
    const { listingId } = req.params;

    const history = await HistoricalPrice.find({ Listing_id: listingId })
      .sort({ createdAt: -1 }); // ✅ use createdAt

    res.json({ total: history.length, data: history });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ message: "Server error" });
  }
};

