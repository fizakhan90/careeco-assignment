import Product from "../models/Product.js";

const suggestAlternatives = async (query) => {
  // Find popular or related products as fallback suggestions
  const fallbackProducts = await Product.find({
    $or: [
      { category: { $regex: query, $options: "i" } },
      { brand: { $regex: query, $options: "i" } },
      { description: { $regex: query, $options: "i" } },
    ],
  })
    .limit(10)
    .select("name price brand category");

  if (fallbackProducts.length > 0) {
    return fallbackProducts;
  }

  // If no match, suggest top-rated or random products
  return await Product.find({})
    .sort({ rating: -1 })
    .limit(10)
    .select("name price brand category");
};

export default suggestAlternatives;
