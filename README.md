# E-Commerce Backend API

A comprehensive Express.js e-commerce backend with advanced features including payment processing, order management, file uploads, and robust error handling.

## 🚀 Features

### Core Features
- **User Authentication & Authorization** - JWT-based authentication with bcrypt password hashing
- **Product Management** - CRUD operations for products with image upload
- **Shopping Cart** - Add, remove, and manage cart items
- **Order Management** - Complete order lifecycle with status tracking
- **Payment Processing** - Stripe integration for secure payments
- **File Upload** - Advanced file upload with validation and Cloudinary integration

### Advanced Features
- **Comprehensive Error Handling** - Custom error classes and middleware
- **Request Validation** - Input validation using express-validator
- **Rate Limiting** - Protection against abuse and DDoS attacks
- **Security Middleware** - Helmet for security headers
- **Logging System** - Winston-based logging with file rotation
- **API Documentation** - Swagger/OpenAPI documentation
- **Compression** - Response compression for better performance
- **Health Checks** - Application health monitoring
- **Graceful Shutdown** - Proper server shutdown handling

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Cloudinary account
- Stripe account (for payments)

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd E-Commerce-Backend-main
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/ecommerce
   SECRET_KEY=your_jwt_secret_key_here
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
   ```

4. **Start the server**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

## 📚 API Documentation

Once the server is running, visit `http://localhost:8000/api-docs` for interactive API documentation.

## 🔧 API Endpoints

### Authentication
- `POST /signup` - Register a new user
- `POST /login` - User login

### Products
- `GET /allproducts` - Get all products
- `GET /product/:id` - Get product by ID
- `POST /addproduct` - Add new product (with image upload)
- `PUT /updateproduct/:id` - Update product
- `POST /removeproduct` - Remove product
- `GET /search` - Search products with filters
- `GET /newcollection` - Get new collection
- `GET /popularinwomen` - Get popular women's products

### Cart
- `POST /addtocart` - Add product to cart
- `POST /getcart` - Get user cart
- `POST /removefromcart` - Remove product from cart

### Orders
- `POST /orders` - Create new order
- `GET /orders` - Get user orders
- `GET /orders/:orderId` - Get order by ID
- `PUT /orders/:orderId/status` - Update order status
- `POST /orders/:orderId/cancel` - Cancel order
- `POST /orders/:orderId/confirm-payment` - Confirm payment
- `GET /orders/stats` - Get order statistics

### Payments
- `POST /payments/create-intent` - Create payment intent
- `POST /payments/confirm` - Confirm payment
- `POST /payments/refund` - Create refund
- `GET /payments/intent/:paymentIntentId` - Get payment intent details
- `POST /payments/customer` - Create or get customer
- `POST /payments/setup-intent` - Create setup intent
- `GET /payments/methods` - Get payment methods
- `POST /payments/webhook` - Stripe webhook handler

### User
- `GET /profile` - Get user profile

### Health Check
- `GET /health` - Application health status

## 🔒 Security Features

### Rate Limiting
- General API: 100 requests per 15 minutes
- Authentication: 5 requests per 15 minutes
- File uploads: 10 uploads per hour
- Search: Speed limiting after 30 requests

### Input Validation
- Request body validation using express-validator
- File type and size validation
- SQL injection protection through Mongoose
- XSS protection through Helmet

### Error Handling
- Custom error classes with proper HTTP status codes
- Detailed error logging
- Graceful error responses
- Unhandled exception handling

## 📁 Project Structure

```
├── controllers/
│   ├── controller.js          # Main controllers
│   ├── orderController.js     # Order management
│   └── paymentController.js   # Payment processing
├── middleware/
│   ├── errorHandler.js        # Error handling middleware
│   ├── validation.js          # Request validation
│   ├── rateLimiter.js         # Rate limiting
│   └── fileUpload.js          # File upload handling
├── models/
│   ├── Product.js             # Product schema
│   ├── User.js                # User schema
│   └── Order.js               # Order schema
├── routes/
│   ├── route.js               # Main routes
│   ├── orderRoutes.js         # Order routes
│   └── paymentRoutes.js       # Payment routes
├── services/
│   └── paymentService.js      # Stripe payment service
├── utils/
│   ├── cloudinary.js          # Cloudinary configuration
│   ├── logger.js              # Winston logger
│   └── swagger.js             # API documentation
├── logs/                      # Application logs
├── uploads/                   # Uploaded files
├── index.js                   # Main server file
└── package.json
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | - |
| `SECRET_KEY` | JWT secret key | - |
| `PORT` | Server port | 8000 |
| `NODE_ENV` | Environment | development |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | - |
| `CLOUDINARY_API_KEY` | Cloudinary API key | - |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | - |
| `STRIPE_SECRET_KEY` | Stripe secret key | - |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | - |
| `ALLOWED_ORIGINS` | CORS allowed origins | http://localhost:3000 |
| `LOG_LEVEL` | Logging level | info |

## 🚀 Deployment

### Production Setup

1. **Set environment variables**
   ```bash
   NODE_ENV=production
   ```

2. **Install dependencies**
   ```bash
   npm ci --only=production
   ```

3. **Start the server**
   ```bash
   npm start
   ```

### Docker Deployment

```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 8000
CMD ["npm", "start"]
```

## 📊 Monitoring

### Health Check
```bash
curl http://localhost:8000/health
```

### Logs
- Application logs: `logs/combined.log`
- Error logs: `logs/error.log`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support, email support@ecommerce.com or create an issue in the repository. 