const express = require("express");
const router = express.Router();
const { fetchUser } = require("../controllers/controller");
const { validatePayment } = require("../middleware/validation");
const {
  createPaymentIntent,
  confirmPayment,
  createRefund,
  getPaymentIntent,
  createCustomer,
  createSetupIntent,
  getPaymentMethods,
  handleWebhook,
} = require("../controllers/paymentController");

/**
 * @swagger
 * /payments/create-intent:
 *   post:
 *     summary: Create payment intent
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *             properties:
 *               amount:
 *                 type: number
 *                 minimum: 0.01
 *               currency:
 *                 type: string
 *                 enum: [usd, eur, gbp]
 *                 default: usd
 *               metadata:
 *                 type: object
 *     responses:
 *       200:
 *         description: Payment intent created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/create-intent", fetchUser, validatePayment, createPaymentIntent);

/**
 * @swagger
 * /payments/confirm:
 *   post:
 *     summary: Confirm payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment confirmed successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/confirm", fetchUser, confirmPayment);

/**
 * @swagger
 * /payments/refund:
 *   post:
 *     summary: Create refund
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - paymentIntentId
 *             properties:
 *               paymentIntentId:
 *                 type: string
 *               amount:
 *                 type: number
 *               reason:
 *                 type: string
 *                 enum: [requested_by_customer, duplicate, fraudulent]
 *     responses:
 *       200:
 *         description: Refund created successfully
 *       400:
 *         description: Bad request
 *       401:
 *         description: Unauthorized
 */
router.post("/refund", fetchUser, createRefund);

/**
 * @swagger
 * /payments/intent/{paymentIntentId}:
 *   get:
 *     summary: Get payment intent details
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentIntentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment intent details retrieved successfully
 *       404:
 *         description: Payment intent not found
 *       401:
 *         description: Unauthorized
 */
router.get("/intent/:paymentIntentId", fetchUser, getPaymentIntent);

/**
 * @swagger
 * /payments/customer:
 *   post:
 *     summary: Create or get customer
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer created or retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.post("/customer", fetchUser, createCustomer);

/**
 * @swagger
 * /payments/setup-intent:
 *   post:
 *     summary: Create setup intent for saving payment methods
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Setup intent created successfully
 *       404:
 *         description: Customer not found
 *       401:
 *         description: Unauthorized
 */
router.post("/setup-intent", fetchUser, createSetupIntent);

/**
 * @swagger
 * /payments/methods:
 *   get:
 *     summary: Get customer payment methods
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 *       404:
 *         description: Customer not found
 *       401:
 *         description: Unauthorized
 */
router.get("/methods", fetchUser, getPaymentMethods);

/**
 * @swagger
 * /payments/webhook:
 *   post:
 *     summary: Stripe webhook handler
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Webhook signature verification failed
 */
router.post("/webhook", handleWebhook);

module.exports = router;
