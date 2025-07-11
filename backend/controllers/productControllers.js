import asyncHandler from "express-async-handler";
import Product from "../models/Product.js";
import suggestAlternatives from "../utils/suggestHelper.js";

// @desc    Get products by search query or all
// @route   GET /api/products/search?q=
const searchProducts = asyncHandler(async (req, res) => {
  const query = req.query.q || "";

  const results = await Product.aggregate([
    {
      $search: {
        index: "default",
        text: {
          query: query,
          path: ["name", "description", "brand", "category"],
          fuzzy: {}, // optional: for typo-tolerance
        },
      },
    },
    { $limit: 10 },
    {
      $project: {
        _id: 1,
        name: 1,
        price: 1,
        brand: 1,
        category: 1,
        image: 1,
        rating: 1,
        numReviews: 1,
        score: { $meta: "searchScore" },
      },
    },
  ]);

  res.json(results);
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error("Product not found");
  }

  // Suggest better deals (similar category, lower or equal price, excluding current product)
  const betterDeals = await Product.find({
    _id: { $ne: product._id }, // exclude current product
    category: product.category,
    price: { $lte: product.price },
  })
    .sort({ price: 1 }) // lowest price first
    .limit(5)
    .select("name price brand category");

  res.json({
    product,
    betterDeals,
  });
});

// @desc    Suggest products if not found or show better deals
// @route   GET /api/products/suggest?q=
const suggestProducts = asyncHandler(async (req, res) => {
  const query = req.query.q || "";
  const suggestions = await suggestAlternatives(query);
  res.json(suggestions);
});

// @route   GET /api/products/
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).limit(20); // you can paginate later
  res.json(products);
});

// @desc    Search products within a category with optional keyword
// @route   GET /api/products/category/:category?q=query
const searchInCategory = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim();
  const category = req.params.category;

  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }

  const pipeline = [
    {
      $search: {
        index: "default",
        compound: {
          must: [
            {
              text: {
                query: category,
                path: "category",
                fuzzy: {}, // optional fuzzy match for category
              },
            },
          ],
          ...(query
            ? {
                should: [
                  {
                    text: {
                      query: query,
                      path: ["name", "description", "brand"],
                      fuzzy: {}, // typo-tolerant
                    },
                  },
                ],
              }
            : {}),
        },
      },
    },
    { $limit: 20 },
    {
      $project: {
        _id: 1,
        name: 1,
        brand: 1,
        category: 1,
        price: 1,
        image: 1,
        rating: 1,
        numReviews: 1,
        score: { $meta: "searchScore" },
      },
    },
  ];

  const results = await Product.aggregate(pipeline);
  res.json(results);
});


export {
  searchProducts,
  getAllProducts,
  getProductById,
  suggestProducts,
  searchInCategory,
};
