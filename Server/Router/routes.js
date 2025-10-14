import express from "express";
import { getAllStoresProducts } from "../Controller/ProductsController.js";
import { getKilimallProducts, getJumiaProducts, getAmazonProducts, getEbayProducts } from "../Controller/ProductsController.js";
import Products from "../Model/Products.js";


const router = express.Router();

router.get("/all-stores", getAllStoresProducts);
router.get("/kilimall", getKilimallProducts);
router.get("/jumia", getJumiaProducts);
router.get("/amazon", getAmazonProducts);
router.get("/ebay", getEbayProducts);

router.get("/test", async (req, res) => {
    console.log("✅ /test route was hit");
    try {
      const productCount = await Products.countDocuments(); // test DB query
      res.json({ 
        message: "Server and DB are working fine ✅",
        totalProducts: productCount
      });
    } catch (err) {
      console.error("Error in /test route:", err.message);
      res.status(500).json({ error: "Database not reachable ❌" });
    }
  });

export default router;
