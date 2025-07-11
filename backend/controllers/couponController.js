import asyncHandler from 'express-async-handler';
import Coupon from '../models/Coupon.js';

// @desc    Apply a coupon code
// @route   POST /api/coupons/apply
const applyCoupon = asyncHandler(async (req, res) => {
  const { code, cartTotal } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });

  if (!coupon) {
    res.status(404);
    throw new Error('Invalid coupon code');
  }

  if (coupon.expiry && new Date() > new Date(coupon.expiry)) {
    res.status(400);
    throw new Error('Coupon has expired');
  }

  const discount = (coupon.discountPercent / 100) * cartTotal;
  const discountedTotal = cartTotal - discount;

  res.json({
    originalTotal: cartTotal,
    discount: Math.round(discount),
    discountedTotal: Math.round(discountedTotal)
  });
});

export { applyCoupon };