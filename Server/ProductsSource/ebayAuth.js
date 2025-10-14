// ebayAuth.js
import axios from "axios";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

let cachedToken = null;
let tokenExpiry = null;

export async function getEbayToken() {
  const now = Date.now();

  // Reuse token if still valid
  if (cachedToken && tokenExpiry && now < tokenExpiry) {
    return cachedToken;
  }

  const clientId = process.env.EBAY_CLIENT_ID;
  const clientSecret = process.env.EBAY_CLIENT_SECRET;
  const env = process.env.EBAY_ENV || "sandbox";

  const endpoint =
    env === "production"
      ? "https://api.ebay.com/identity/v1/oauth2/token"
      : "https://api.sandbox.ebay.com/identity/v1/oauth2/token";

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const response = await axios.post(
      endpoint,
      new URLSearchParams({
        grant_type: "client_credentials",
        scope: "https://api.ebay.com/oauth/api_scope", // sandbox uses same scope
      }),
      {
        headers: {
          Authorization: `Basic ${basicAuth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    cachedToken = response.data.access_token;
    tokenExpiry = now + response.data.expires_in * 1000;

    console.log("🔑 Got new eBay token");
    return cachedToken;
  } catch (error) {
    console.error("❌ Failed to fetch eBay token:", error.response?.data || error.message);
    throw error;
  }
}
