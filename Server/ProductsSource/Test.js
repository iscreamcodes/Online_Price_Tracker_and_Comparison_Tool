// tester.js
import chalk from "chalk";
import { fetchEbayProducts } from "./ebayApi.js";

async function testEbay() {
  const query = "MacBook"; // 🧠 change this to anything you want
  console.log(chalk.cyanBright(`\n🔍 Searching eBay for "${query}"...\n`));

  try {
    const products = await fetchEbayProducts(query);

    if (!products.length) {
      console.log(chalk.yellow("⚠️ No products found — maybe try a broader keyword."));
      return;
    }

    console.log(chalk.greenBright(`✅ Found ${products.length} products:\n`));

    products.slice(0, 5).forEach((p, i) => {
      console.log(chalk.magenta.bold(`${i + 1}. ${p.name}`));
      console.log(chalk.green(`   💲 Price: ${p.price} ${p.currency || ""}`));
      console.log(chalk.blue(`   🏬 Store: ${p.store}`));
      console.log(chalk.gray(`   🔗 URL: ${p.url}`));
      console.log(chalk.dim(`   🖼️  Image: ${p.image}\n`));
    });
  } catch (error) {
    console.error(chalk.red("❌ Test failed:"), error.message);
  }
}

testEbay();
