import Product from "../Model/ProductsModel.js";

export const saveProducts = async (products) => {
  try {
    const savedProducts = [];
    
    for (const product of products) {
      // Check if product already exists
      const existingProduct = await Product.findOne({
        productId: product.id,
        store: product.store
      });

      if (existingProduct) {
        // Update price and add to history if price changed
        if (existingProduct.price !== product.price) {
          existingProduct.priceHistory.push({
            price: product.price,
            date: new Date()
          });
          existingProduct.price = product.price;
          existingProduct.lastChecked = new Date();
          await existingProduct.save();
          savedProducts.push(existingProduct);
        }
      } else {
        // Create new product with initial price history
        const newProduct = new Product({
          ...product,
          productId: product.id,
          priceHistory: [{
            price: product.price,
            date: new Date()
          }]
        });
        await newProduct.save();
        savedProducts.push(newProduct);
      }
    }

    console.log(`💾 Saved/Updated ${savedProducts.length} products`);
    return { success: true, count: savedProducts.length };
  } catch (error) {
    console.error('❌ Error saving products:', error);
    return { success: false, error: error.message };
  }
};