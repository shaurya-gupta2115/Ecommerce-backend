const express = require("express");
const cors = require("cors");
const app = express();
const path = require("path");
const multer = require("multer");
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage });

// Import middleware
const {
  validateProduct,
  validateSignup,
  validateLogin,
  validateSearch,
} = require("../middleware/validation");
const {
  handleSingleUpload,
  handleMultipleUpload,
  handleGalleryUpload,
} = require("../middleware/fileUpload");
const {
  uploadLimiter,
  searchSpeedLimiter,
} = require("../middleware/rateLimiter");

// Middlewares
app.use(express.json());
app.use(cors());

const {
  getHome,
  getImages,
  addProduct,
  removeProduct,
  getAllProducts,
  signup,
  login,
  getNewCollection,
  getPopularInWomen,
  addToCart,
  removeFromCart,
  getCart,
  fetchUser,
  getProductById,
  updateProduct,
  searchProducts,
  getProfile,
} = require("../controllers/controller");

const router = express.Router();

/**
 * @swagger
 * /:
 *   get:
 *     summary: Get home page
 *     tags: [General]
 *     responses:
 *       200:
 *         description: Express App is Running
 */
router.get("/", getHome);

/**
 * @swagger
 * /getImage:
 *   get:
 *     summary: Get all product images
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Images fetched successfully
 *       500:
 *         description: Error fetching images
 */
router.get("/getImage", getImages);

/**
 * @swagger
 * /addproduct:
 *   post:
 *     summary: Add a new product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - category
 *               - new_price
 *               - old_price
 *             properties:
 *               name:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *               category:
 *                 type: string
 *                 enum: [men, women, kids, accessories]
 *               new_price:
 *                 type: number
 *               old_price:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product added successfully
 *       400:
 *         description: Bad request
 *       500:
 *         description: Server error
 */
router.post(
  "/addproduct",
  uploadLimiter,
  handleSingleUpload,
  validateProduct,
  addProduct
);

/**
 * @swagger
 * /removeproduct:
 *   post:
 *     summary: Remove a product
 *     tags: [Products]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - id
 *               - name
 *               - image
 *             properties:
 *               id:
 *                 type: number
 *               name:
 *                 type: string
 *               image:
 *                 type: object
 *                 properties:
 *                   public_id:
 *                     type: string
 *     responses:
 *       200:
 *         description: Product removed successfully
 */
router.post("/removeproduct", removeProduct);

/**
 * @swagger
 * /allproducts:
 *   get:
 *     summary: Get all products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: All products fetched successfully
 */
router.get("/allproducts", getAllProducts);

/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minLength: 6
 *     responses:
 *       200:
 *         description: User registered successfully
 *       400:
 *         description: Bad request or user already exists
 */
router.post("/signup", validateSignup, signup);

/**
 * @swagger
 * /login:
 *   post:
 *     summary: User login
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid credentials
 */
router.post("/login", validateLogin, login);

/**
 * @swagger
 * /newcollection:
 *   get:
 *     summary: Get new collection products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: New collection fetched successfully
 */
router.get("/newcollection", getNewCollection);

/**
 * @swagger
 * /popularinwomen:
 *   get:
 *     summary: Get popular women's products
 *     tags: [Products]
 *     responses:
 *       200:
 *         description: Popular women's products fetched successfully
 */
router.get("/popularinwomen", getPopularInWomen);

/**
 * @swagger
 * /addtocart:
 *   post:
 *     summary: Add product to cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product added to cart successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/addtocart", fetchUser, addToCart);

/**
 * @swagger
 * /getcart:
 *   post:
 *     summary: Get user cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart data fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/getcart", fetchUser, getCart);

/**
 * @swagger
 * /removefromcart:
 *   post:
 *     summary: Remove product from cart
 *     tags: [Cart]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - itemId
 *             properties:
 *               itemId:
 *                 type: number
 *     responses:
 *       200:
 *         description: Product removed from cart successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/removefromcart", fetchUser, removeFromCart);

/**
 * @swagger
 * /product/{id}:
 *   get:
 *     summary: Get product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Product fetched successfully
 *       404:
 *         description: Product not found
 */
router.get("/product/:id", getProductById);

/**
 * @swagger
 * /updateproduct/{id}:
 *   put:
 *     summary: Update product
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               category:
 *                 type: string
 *               new_price:
 *                 type: number
 *               old_price:
 *                 type: number
 *               available:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       404:
 *         description: Product not found
 */
router.put("/updateproduct/:id", updateProduct);

/**
 * @swagger
 * /search:
 *   get:
 *     summary: Search products
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [men, women, kids, accessories]
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *     responses:
 *       200:
 *         description: Search results
 *       400:
 *         description: Bad request
 */
router.get("/search", searchSpeedLimiter, searchProducts);

/**
 * @swagger
 * /profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Profile fetched successfully
 *       401:
 *         description: Unauthorized
 */
router.get("/profile", fetchUser, getProfile);

module.exports = router;
