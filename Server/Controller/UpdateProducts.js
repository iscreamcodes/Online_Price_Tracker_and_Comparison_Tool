// Controller/UpdateProducts.js
import { fetchEbayProducts } from "../ProductsSource/ebayApi.js";
import { fetchJumiaProducts, fetchAmazonProducts } from "../ProductsSource/jumiaPuppeteer.js";
import { saveProducts } from "./ProductsController.js"; // reusable function to save to MongoDB

export async function updateProducts(req, res) {
  try {
    const query = req.query.q || 'dress';

    // Fetch products from all sources in parallel
    const [ebayProducts, jumiaProducts, amazonProducts] = await Promise.all([
      fetchEbayProducts(query),
      fetchJumiaProducts(query),
      fetchAmazonProducts(query)
    ]);

    const allProducts = [...ebayProducts, ...jumiaProducts, ...amazonProducts];

    console.log("Fetched eBay products:", ebayProducts);
console.log("Fetched Jumia products:", jumiaProducts);
console.log("Fetched Amazon products:", amazonProducts);

    // Save all products using the reusable function
    await saveProducts(allProducts);

    res.status(200).json({ message: 'Products updated successfully!', total: allProducts.length });
  } catch (error) {
    console.error("❌ Error updating products:", error);
    res.status(500).json({ error: 'Failed to update products.' });
  }
}
