import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';

// @desc    Place new order
// @route   POST /api/orders
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, orderItems, totalPrice, paymentMethod, guest = false } = req.body;

  const order = new Order({
    user: guest ? null : req.user._id,
    orderItems,
    shippingAddress,
    totalPrice,
    paymentMethod,
    guest,
    status: 'Processing',
  });

  const createdOrder = await order.save();
  res.status(201).json(createdOrder);
});

// @desc    Get logged-in user's orders
// @route   GET /api/orders/history
const getOrderHistory = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id });
  res.json(orders);
});

// @desc    Cancel an order
// @route   PUT /api/orders/:id/cancel
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (order && order.status !== 'Cancelled') {
    order.status = 'Cancelled';
    await order.save();
    res.json(order);
  } else {
    res.status(404).json({ message: 'Order not found or already cancelled' });
  }
});

export { placeOrder, getOrderHistory, cancelOrder };
