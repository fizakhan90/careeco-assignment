import asyncHandler from 'express-async-handler';
import Order from '../models/Order.js';

// @desc    Place new order
// @route   POST /api/orders
const placeOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, orderItems, totalPrice, paymentMethod } = req.body;

  // Determine if this is a guest checkout.
  // req.user is added by your 'protect' middleware. If it doesn't exist, it's a guest.
  const isGuest = !req.user;

  // Create a new order instance based on your schema
  const order = new Order({
    // If it's a guest, user is null. If logged in, use their ID.
    user: isGuest ? null : req.user._id, 
    guest: isGuest,
    orderItems,
    shippingAddress,
    totalPrice,
    paymentMethod,
    status: 'Processing',
    isPaid: true,               
    paidAt: Date.now() 
  });

  // Save the order to the database
  const createdOrder = await order.save();
  
  // Send a success response back to the frontend
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
