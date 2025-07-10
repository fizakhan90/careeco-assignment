import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const protect = async (req, res, next) => {
  let token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }

 try {
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  console.log('Decoded:', decoded);
  req.user = await User.findById(decoded.userId).select('-password');
  next();
} catch (error) {
  console.error('JWT Error:', error.message);
  res.status(401).json({ message: 'Token failed' });
}
};

export default protect;