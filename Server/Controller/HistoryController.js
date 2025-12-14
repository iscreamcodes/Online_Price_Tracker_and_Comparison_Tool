import HistoricalPrice from "../Model/History.js";

// Save a new historical price
export const saveHistoricalPrice = async (req, res) => {
  try {
    const { History_listing_id, History_Price } = req.body; // Changed from Listing_id

    if (!History_listing_id || !History_Price)
      return res.status(400).json({ message: "Missing required fields" });

    const newRecord = new HistoricalPrice({
      History_listing_id, // Changed from Listing_id
      History_Price,
    });

    await newRecord.save();
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
    const history = await HistoricalPrice.find({ History_listing_id: listingId }) // Changed from Listing_id
      .sort({ History_createdAt: -1 }); // Changed from createdAt

    res.json({ total: history.length, data: history });
  } catch (err) {
    console.error("Error fetching history:", err);
    res.status(500).json({ message: "Server error" });
  }
};