const PaymentService = require("../services/paymentService");
const Users = require("../models/User");
const logger = require("../utils/logger");
const { AppError } = require("../middleware/errorHandler");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create payment intent
const createPaymentIntent = async (req, res, next) => {
  try {
    const { amount, currency = "usd", metadata = {} } = req.body;
    const userId = req.user.id;

    // Add user info to metadata
    const userMetadata = {
      ...metadata,
      userId: userId,
    };

    const paymentIntent = await PaymentService.createPaymentIntent(
      amount,
      currency,
      userMetadata
    );

    logger.info(
      `Payment intent created: ${paymentIntent.id} for user: ${userId}`
    );

    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        clientSecret: paymentIntent.client_secret,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Confirm payment
const confirmPayment = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    const paymentIntent = await PaymentService.confirmPaymentIntent(
      paymentIntentId
    );

    logger.info(`Payment confirmed: ${paymentIntentId} for user: ${userId}`);

    res.json({
      success: true,
      message: "Payment confirmed successfully",
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create refund
const createRefund = async (req, res, next) => {
  try {
    const {
      paymentIntentId,
      amount,
      reason = "requested_by_customer",
    } = req.body;
    const userId = req.user.id;

    const refund = await PaymentService.createRefund(
      paymentIntentId,
      amount,
      reason
    );

    logger.info(`Refund created: ${refund.id} for user: ${userId}`);

    res.json({
      success: true,
      message: "Refund processed successfully",
      refund: {
        id: refund.id,
        amount: refund.amount,
        status: refund.status,
        reason: refund.reason,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get payment intent details
const getPaymentIntent = async (req, res, next) => {
  try {
    const { paymentIntentId } = req.params;
    const userId = req.user.id;

    const paymentIntent = await PaymentService.getPaymentIntent(
      paymentIntentId
    );

    logger.info(
      `Payment intent retrieved: ${paymentIntentId} by user: ${userId}`
    );

    res.json({
      success: true,
      paymentIntent: {
        id: paymentIntent.id,
        status: paymentIntent.status,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        created: paymentIntent.created,
        metadata: paymentIntent.metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create or get customer
const createCustomer = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    // Check if user already has a Stripe customer ID
    if (user.stripeCustomerId) {
      const customer = await PaymentService.getCustomer(user.stripeCustomerId);

      res.json({
        success: true,
        customer: {
          id: customer.id,
          email: customer.email,
          name: customer.name,
        },
      });
      return;
    }

    // Create new customer
    const customer = await PaymentService.createCustomer(
      user.email,
      user.name,
      { userId: userId }
    );

    // Save Stripe customer ID to user
    user.stripeCustomerId = customer.id;
    await user.save();

    logger.info(`Customer created: ${customer.id} for user: ${userId}`);

    res.json({
      success: true,
      customer: {
        id: customer.id,
        email: customer.email,
        name: customer.name,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Create setup intent for saving payment methods
const createSetupIntent = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);

    if (!user || !user.stripeCustomerId) {
      throw new AppError("Customer not found", 404);
    }

    const setupIntent = await PaymentService.createSetupIntent(
      user.stripeCustomerId
    );

    logger.info(`Setup intent created: ${setupIntent.id} for user: ${userId}`);

    res.json({
      success: true,
      setupIntent: {
        id: setupIntent.id,
        clientSecret: setupIntent.client_secret,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get customer payment methods
const getPaymentMethods = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const user = await Users.findById(userId);

    if (!user || !user.stripeCustomerId) {
      throw new AppError("Customer not found", 404);
    }

    const paymentMethods = await PaymentService.listPaymentMethods(
      user.stripeCustomerId
    );

    logger.info(`Payment methods retrieved for user: ${userId}`);

    res.json({
      success: true,
      paymentMethods: paymentMethods.map((method) => ({
        id: method.id,
        type: method.type,
        card: method.card
          ? {
              brand: method.card.brand,
              last4: method.card.last4,
              expMonth: method.card.exp_month,
              expYear: method.card.exp_year,
            }
          : null,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// Webhook handler for Stripe events
const handleWebhook = async (req, res, next) => {
  try {
    const sig = req.headers["stripe-signature"];
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err) {
      logger.error(`Webhook signature verification failed: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded":
        const paymentIntent = event.data.object;
        logger.info(`Payment succeeded: ${paymentIntent.id}`);
        // Handle successful payment
        break;

      case "payment_intent.payment_failed":
        const failedPayment = event.data.object;
        logger.warn(`Payment failed: ${failedPayment.id}`);
        // Handle failed payment
        break;

      case "customer.subscription.created":
        const subscription = event.data.object;
        logger.info(`Subscription created: ${subscription.id}`);
        // Handle subscription creation
        break;

      default:
        logger.info(`Unhandled event type: ${event.type}`);
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentIntent,
  confirmPayment,
  createRefund,
  getPaymentIntent,
  createCustomer,
  createSetupIntent,
  getPaymentMethods,
  handleWebhook,
};
