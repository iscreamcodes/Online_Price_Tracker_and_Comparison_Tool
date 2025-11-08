import express from "express";
import { getAllStoresProducts } from "../Controller/ProductsController.js";
//import { getKilimallProducts, getJumiaProducts, getAmazonProducts } from "../Controller/ProductsController.js";
import Products from "../Model/Products.js";
import AuthRoutes from "./AuthRoutes.js";
import HistoryRoutes from "./HistoryRoutes.js";
import { trackListing } from "../Controller/UserController.js";
import savedListingsRoutes from "./savedListingRoutes.js"; 
import AdminRoutes from "./AdminRoutes.js";


const router = express.Router();

router.get("/all-stores", getAllStoresProducts);
//router.get("/kilimall", getKilimallProducts);
//router.get("/jumia", getJumiaProducts);
//router.get("/amazon", getAmazonProducts);


router.post("/track-product", trackListing);


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

  router.use("/", savedListingsRoutes);

  router.use("/auth", AuthRoutes); 
  router.use("/history", HistoryRoutes);
 
  router.use("/admin", AdminRoutes); // now GET /api/admin/users works

export default router;
