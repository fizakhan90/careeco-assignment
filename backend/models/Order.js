import mongoose from 'mongoose';


const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  shippingAddress: {
    fullName: { type: String, required: true },
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    postalCode: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    phone: { type: String, required: true },
  },
  orderItems: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      name: String,
      quantity: Number,
      size: String,
      price: Number,
    },
  ],
  totalPrice: { type: Number, required: true },
  status: { type: String, default: 'Processing' },
  isPaid: { type: Boolean, default: false },
  paidAt: { type: Date },
  paymentMethod: { type: String },
}, { timestamps: true });


const Order = mongoose.model('Order', orderSchema);
export default Order;