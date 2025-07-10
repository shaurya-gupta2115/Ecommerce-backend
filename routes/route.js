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

// Middlewares
app.use(express.json());
app.use(cors());

const {
  getHome,
  // uploadImage,
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
  // upload,
  getProductById,
  updateProduct,
  searchProducts,
  getProfile,
} = require("../controllers/controller");
const router = express.Router();

// API for getting home page
router.get("/", getHome);

// API for displaying images
router.use("/uploads", express.static("uploads"));

router.get("/getImage", getImages);

// API for uploading image
// router.post("/upload", upload.single("product"), uploadImage);

// API for adding product
router.post("/addproduct", upload.single("image"), addProduct);

// API for removing product
router.post("/removeproduct", removeProduct);

// API for getting all products
router.get("/allproducts", getAllProducts);

// API for signup
router.post("/signup", signup);

// API for login
router.post("/login", login);

// API for getting new collection
router.get("/newcollection", getNewCollection);

// API for getting popular in women section
router.get("/popularinwomen", getPopularInWomen);

// API for adding product to cart
router.post("/addtocart", fetchUser, addToCart);

// API for getting cart data
router.post("/getcart", fetchUser, getCart);

// API for removing product from cart
router.post("/removefromcart", fetchUser, removeFromCart);

router.get("/product/:id", getProductById);
router.put("/updateproduct/:id", updateProduct);
router.get("/search", searchProducts);
router.get("/profile", fetchUser, getProfile);

module.exports = router;
