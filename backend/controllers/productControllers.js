import asyncHandler from 'express-async-handler';
import Product from '../models/Product.js';
import suggestAlternatives from '../utils/suggestHelper.js';

// @desc    Get products by search query or all
// @route   GET /api/products/search?q=
const searchProducts = asyncHandler(async (req, res) => {
  const query = req.query.q || '';

  const results = await Product.aggregate([
    {
      $search: {
        index: 'default',
        text: {
          query: query,
          path: ['name', 'description', 'brand', 'category'],
          fuzzy: {} // optional: for typo-tolerance
        }
      }
    },
    { $limit: 10 },
    {
      $project: {
        _id: 1,
        name: 1,
        brand: 1,
        category: 1,
        score: { $meta: 'searchScore' }
      }
    }
  ]);

  res.json(results);
});

// @desc    Get single product by ID
// @route   GET /api/products/:id
const getProductById = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (product) {
    res.json(product);
  } else {
    res.status(404);
    throw new Error('Product not found');
  }
});

// @desc    Suggest products if not found or show better deals
// @route   GET /api/products/suggest?q=
const suggestProducts = asyncHandler(async (req, res) => {
  const query = req.query.q || '';
  const suggestions = await suggestAlternatives(query);
  res.json(suggestions);
});

const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({}).limit(20); // you can paginate later
  res.json(products);
});

export { searchProducts, getAllProducts,getProductById, suggestProducts };