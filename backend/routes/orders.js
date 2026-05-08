const express = require("express");
const requireAuth = require("../middleware/auth");
const Order = require("../models/Order");

const router = express.Router();

const ORDER_API = process.env.ORDER_API_URL || "http://13.236.80.206:4002";

// Create an order after successful payment
router.post("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const {
      service,
      promoCode = "",
      value,
      productName,
      productImage = "",
      invoiceId = "",
    } = req.body || {};

    if (!service || !productName || !value || Number(value) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required order fields" });
    }

    const safeService = String(service).trim().slice(0, 200);
    const safePromo = String(promoCode || "").trim().slice(0, 60);
    const amount = Number(value);

    // Upstream order-creation API
    // Format: /create={service}={promo}={value}
    const url = `${ORDER_API}/create=${encodeURIComponent(safeService)}=${encodeURIComponent(
      safePromo
    )}=${encodeURIComponent(amount)}`;

    let upstream;
    try {
      upstream = await fetch(url);
    } catch (err) {
      console.error("[orders/create upstream]", err.message || err);
      return res
        .status(502)
        .json({ success: false, message: "Order service unavailable" });
    }

    let data = null;
    try {
      data = await upstream.json();
    } catch {
      /* ignore */
    }

    if (!upstream.ok || !data || !data.order_id) {
      return res
        .status(502)
        .json({ success: false, message: "Invalid response from order service" });
    }

    const order = await Order.create({
      userId,
      orderId: String(data.order_id),
      productName: String(productName).trim().slice(0, 300),
      productImage: String(productImage || "").slice(0, 2000),
      amount,
      status: (data.status || "PROCESSING").toUpperCase(),
      invoiceId: String(invoiceId || "").slice(0, 120),
      promoCode: safePromo,
    });

    res.json({ success: true, order: order.toSafeJSON() });
  } catch (err) {
    console.error("[orders/create]", err.message || err);
    res.status(500).json({ success: false, message: "Failed to create order" });
  }
});

// List current user's orders
router.get("/", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .limit(200);
    res.json({
      success: true,
      orders: orders.map((o) => o.toSafeJSON()),
    });
  } catch (err) {
    console.error("[orders/list]", err.message || err);
    res.status(500).json({ success: false, message: "Failed to load orders" });
  }
});

// Verify order status (proxy + DB sync)
router.get("/verify/:orderId", requireAuth, async (req, res) => {
  try {
    const userId = req.user?.id || req.user?.sub;
    if (!userId) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    const { orderId } = req.params;
    if (!/^[A-Za-z0-9_-]{4,64}$/.test(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid order id" });
    }

    const order = await Order.findOne({
      orderId,
      userId,
    });
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    // If already completed, return cached state
    if (order.status === "COMPLETED") {
      res.set({
        "Cache-Control": "no-store, no-cache, must-revalidate",
        Pragma: "no-cache",
        Expires: "0",
      });
      return res.json({ success: true, status: "COMPLETED" });
    }

    let upstreamStatus = order.status;
    try {
      const upstream = await fetch(
        `${ORDER_API}/verify=${encodeURIComponent(orderId)}?t=${Date.now()}`,
        { headers: { "Cache-Control": "no-cache" } }
      );
      const data = await upstream.json().catch(() => null);
      if (data && data.status) {
        upstreamStatus = String(data.status).toUpperCase();
      }
    } catch (err) {
      console.warn("[orders/verify upstream]", err.message || err);
    }

    if (upstreamStatus !== order.status) {
      order.status = upstreamStatus;
      await order.save();
    }

    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    });
    res.json({ success: true, status: order.status });
  } catch (err) {
    console.error("[orders/verify]", err.message || err);
    res.status(500).json({ success: false, message: "Failed to verify order" });
  }
});

module.exports = router;
