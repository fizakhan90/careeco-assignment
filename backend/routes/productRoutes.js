import express from 'express';
import { searchProducts, getProductById, suggestProducts ,getAllProducts} from '../controllers/productControllers.js';

const router = express.Router();

// routes/productRoutes.js
router.get('/search', searchProducts)
router.get('/suggest', suggestProducts);
router.get('/', getAllProducts); 

router.get('/:id', getProductById);

export default router;