import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: false,
});

export async function fetchAllProducts(query = "iphone") {
  try {
    const res = await api.get(`/all-stores?q=${query}`);
    console.log("🧩 Backend response:", res.data);

    // If backend returns groupedProducts
    const products = res.data.groupedProducts
      ? res.data.groupedProducts.flatMap((g) => g.products)
      : res.data.products || [];

    return products;
  } catch (err) {
    console.error("❌ Failed to fetch products:", err.response?.data || err.message);
    return [];
  }
}
