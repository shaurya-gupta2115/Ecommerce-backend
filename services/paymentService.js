const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const logger = require("../utils/logger");
const { AppError } = require("../middleware/errorHandler");

class PaymentService {
  // Create payment intent
  static async createPaymentIntent(amount, currency = "usd", metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: currency.toLowerCase(),
        metadata: metadata,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`Payment intent created: ${paymentIntent.id}`);
      return paymentIntent;
    } catch (error) {
      logger.error(`Error creating payment intent: ${error.message}`);
      throw new AppError("Failed to create payment intent", 500);
    }
  }

  // Confirm payment intent
  static async confirmPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );

      if (paymentIntent.status === "succeeded") {
        logger.info(`Payment confirmed: ${paymentIntentId}`);
        return paymentIntent;
      } else {
        throw new AppError("Payment not completed", 400);
      }
    } catch (error) {
      logger.error(`Error confirming payment: ${error.message}`);
      throw new AppError("Failed to confirm payment", 500);
    }
  }

  // Create refund
  static async createRefund(
    paymentIntentId,
    amount = null,
    reason = "requested_by_customer"
  ) {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason: reason,
      };

      if (amount) {
        refundData.amount = Math.round(amount * 100);
      }

      const refund = await stripe.refunds.create(refundData);

      logger.info(`Refund created: ${refund.id}`);
      return refund;
    } catch (error) {
      logger.error(`Error creating refund: ${error.message}`);
      throw new AppError("Failed to create refund", 500);
    }
  }

  // Get payment intent details
  static async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(
        paymentIntentId
      );
      return paymentIntent;
    } catch (error) {
      logger.error(`Error retrieving payment intent: ${error.message}`);
      throw new AppError("Payment intent not found", 404);
    }
  }

  // Create customer
  static async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await stripe.customers.create({
        email: email,
        name: name,
        metadata: metadata,
      });

      logger.info(`Customer created: ${customer.id}`);
      return customer;
    } catch (error) {
      logger.error(`Error creating customer: ${error.message}`);
      throw new AppError("Failed to create customer", 500);
    }
  }

  // Get customer
  static async getCustomer(customerId) {
    try {
      const customer = await stripe.customers.retrieve(customerId);
      return customer;
    } catch (error) {
      logger.error(`Error retrieving customer: ${error.message}`);
      throw new AppError("Customer not found", 404);
    }
  }

  // Create setup intent for saving payment methods
  static async createSetupIntent(customerId) {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        payment_method_types: ["card"],
      });

      logger.info(`Setup intent created: ${setupIntent.id}`);
      return setupIntent;
    } catch (error) {
      logger.error(`Error creating setup intent: ${error.message}`);
      throw new AppError("Failed to create setup intent", 500);
    }
  }

  // List customer payment methods
  static async listPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: "card",
      });

      return paymentMethods.data;
    } catch (error) {
      logger.error(`Error listing payment methods: ${error.message}`);
      throw new AppError("Failed to list payment methods", 500);
    }
  }
}

module.exports = PaymentService;
