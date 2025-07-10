import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  brand: { type: String, required: true },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  sizes: [{ type: String }],
  image: { type: String },
  rating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },
  isAvailable: { type: Boolean, default: true },
}, { timestamps: true });

const Product = mongoose.model('Product', productSchema);
export default Product;