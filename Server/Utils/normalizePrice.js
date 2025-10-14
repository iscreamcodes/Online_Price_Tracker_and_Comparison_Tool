const currencyRatesKES = {
    KES: 1,           // base
    USD: 150,         // 1 USD ≈ 150 KES
    EUR: 165          // 1 EUR ≈ 165 KES
  };
  
  export function normalizePriceToKES(price, currency) {
    if (!currencyRatesKES[currency]) return price; // fallback
    return price * currencyRatesKES[currency];
  }
  