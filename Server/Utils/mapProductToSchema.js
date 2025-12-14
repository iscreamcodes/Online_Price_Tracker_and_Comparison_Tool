export function mapToProductSchemaFields(product) {
  return {
    Product_code: product.Product_code || `PROD_${Math.random().toString(36).substr(2, 9)}`, // Added Product_code
    Product_Name: product.name || "Unknown Product",
    Product_Category_code: product.category_code || "CAT_GENERAL", // Added Product_Category_code
    Product_Category: product.category || "General",
    Product_Image_URL: product.image || null,
    // Removed: Product_Description, Product_Specs, Product_Store
    Product_Created_At: product.last_checked || new Date(),
    Product_Updated_At: new Date(),
  };
}