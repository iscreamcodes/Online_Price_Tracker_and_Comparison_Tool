// ebayApi.js
import axios from "axios";
import { getEbayToken } from "./ebayAuth.js";

export async function fetchEbayProducts(query) {
  try {
    const token = await getEbayToken();
    const env = process.env.EBAY_ENV || "sandbox";

    const baseUrl =
      env === "production"
        ? "https://api.ebay.com/buy/browse/v1"
        : "https://api.sandbox.ebay.com/buy/browse/v1";

    const url = `${baseUrl}/item_summary/search?q=${encodeURIComponent(query)}`;

    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const items = response.data?.itemSummaries || [];

    return items.map((item) => {
      const image =
        item.image?.imageUrl ||
        item.thumbnailImages?.[0]?.imageUrl ||
        (item.itemId
          ? `https://i.ebayimg.com/images/g/${item.itemId}/s-l1600.jpg`
          : "https://via.placeholder.com/200x200?text=No+Image");

      return {
        name: item.title || "Unnamed Product",
        price: item.price?.value || 0,
        currency: item.price?.currency || "USD",
        store: "eBay",
        image,
        url: item.itemWebUrl || `https://www.ebay.com/itm/${item.itemId}`,
        rating: null,
        last_checked: new Date(),
      };
    });
  } catch (error) {
    console.error("❌ Error fetching eBay products:", error.response?.data || error.message);
    return [];
  }
}
