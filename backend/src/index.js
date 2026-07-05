import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';

import authRoutes from './routes/auth.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import userRoutes from './routes/user.routes.js';
import categoryRoutes from './routes/category.routes.js';
import supplierRoutes from './routes/supplier.routes.js';
import purchaseOrderRoutes from './routes/purchase_order.routes.js';
import stockRoutes from './routes/stock.routes.js';
import invoiceRoutes from './routes/invoice.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: false
}));
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', userRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/invoices', invoiceRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Librairie API - Maroc', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Serveur demarre sur http://localhost:${PORT}`);
});