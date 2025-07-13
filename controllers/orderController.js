const Order = require("../models/Order");
const Product = require("../models/Product");
const Users = require("../models/User");
const PaymentService = require("../services/paymentService");
const logger = require("../utils/logger");
const { AppError } = require("../middleware/errorHandler");

// Create new order
const createOrder = async (req, res, next) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;
    const userId = req.user.id;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      throw new AppError("Order must contain at least one item", 400);
    }

    // Calculate total and validate products
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) {
        throw new AppError(`Product not found: ${item.productId}`, 404);
      }
      if (!product.available) {
        throw new AppError(`Product not available: ${product.name}`, 400);
      }
      if (item.quantity < 1) {
        throw new AppError(
          `Invalid quantity for product: ${product.name}`,
          400
        );
      }

      const itemTotal = product.new_price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        product: product._id,
        quantity: item.quantity,
        price: product.new_price,
      });
    }

    // Create order
    const order = new Order({
      user: userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod,
      notes,
    });

    await order.save();

    // Create payment intent if using Stripe
    let paymentIntent = null;
    if (paymentMethod === "stripe") {
      paymentIntent = await PaymentService.createPaymentIntent(
        totalAmount,
        "usd",
        { orderId: order._id.toString() }
      );
      order.paymentIntentId = paymentIntent.id;
      await order.save();
    }

    logger.info(`Order created: ${order._id} by user: ${userId}`);

    res.status(201).json({
      success: true,
      order: {
        id: order._id,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentStatus: order.paymentStatus,
        paymentIntent: paymentIntent
          ? {
              id: paymentIntent.id,
              clientSecret: paymentIntent.client_secret,
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get user orders
const getUserOrders = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { page = 1, limit = 10, status } = req.query;

    const query = { user: userId };
    if (status) {
      query.status = status;
    }

    const orders = await Order.find(query)
      .populate("items.product", "name image new_price")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await Order.countDocuments(query);

    logger.info(`Orders retrieved for user: ${userId}`);

    res.json({
      success: true,
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
    });
  } catch (error) {
    next(error);
  }
};

// Get order by ID
const getOrderById = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId })
      .populate("items.product", "name image new_price category")
      .populate("user", "name email");

    if (!order) {
      throw new AppError("Order not found", 404);
    }

    logger.info(`Order retrieved: ${orderId} by user: ${userId}`);

    res.json({
      success: true,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// Update order status (admin only)
const updateOrderStatus = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, estimatedDelivery } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // Update fields
    if (status) order.status = status;
    if (trackingNumber) order.trackingNumber = trackingNumber;
    if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

    await order.save();

    logger.info(`Order status updated: ${orderId} to ${status}`);

    res.json({
      success: true,
      order: {
        id: order._id,
        status: order.status,
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Cancel order
const cancelOrder = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // Check if order can be cancelled
    if (order.status === "delivered" || order.status === "cancelled") {
      throw new AppError("Order cannot be cancelled", 400);
    }

    order.status = "cancelled";
    await order.save();

    // Process refund if payment was made
    if (order.paymentStatus === "completed" && order.paymentIntentId) {
      try {
        await PaymentService.createRefund(order.paymentIntentId);
        order.paymentStatus = "refunded";
        await order.save();
      } catch (refundError) {
        logger.error(
          `Refund failed for order ${orderId}: ${refundError.message}`
        );
      }
    }

    logger.info(`Order cancelled: ${orderId} by user: ${userId}`);

    res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    next(error);
  }
};

// Confirm payment
const confirmPayment = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    const { paymentIntentId } = req.body;
    const userId = req.user.id;

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    // Confirm payment with Stripe
    const paymentIntent = await PaymentService.confirmPaymentIntent(
      paymentIntentId
    );

    order.paymentStatus = "completed";
    order.status = "processing";
    await order.save();

    logger.info(`Payment confirmed for order: ${orderId}`);

    res.json({
      success: true,
      message: "Payment confirmed successfully",
      order: {
        id: order._id,
        status: order.status,
        paymentStatus: order.paymentStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// Get order statistics (admin only)
const getOrderStats = async (req, res, next) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalAmount: { $sum: "$totalAmount" },
        },
      },
    ]);

    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      { $match: { paymentStatus: "completed" } },
      { $group: { _id: null, total: { $sum: "$totalAmount" } } },
    ]);

    logger.info("Order statistics retrieved");

    res.json({
      success: true,
      stats: {
        byStatus: stats,
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  confirmPayment,
  getOrderStats,
};
