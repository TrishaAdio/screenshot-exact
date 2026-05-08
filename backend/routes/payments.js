const express = require("express");

const router = express.Router();

const PAY_API = process.env.PAY_API_URL || "http://13.236.80.206:4000";

// Proxy: create payment / QR
router.post("/create", async (req, res) => {
  try {
    const { amount, merchant_name } = req.body || {};
    if (!amount || Number(amount) <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid amount" });
    }

    const merchantName = String(merchant_name || "SymDeals Order").trim().slice(0, 80);

    const upstream = await fetch(`${PAY_API}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: Number(amount),
        merchant_name: merchantName,
        merchant_desc: merchantName,
      }),
    });

    const text = await upstream.text();
    res
      .status(upstream.status)
      .type(upstream.headers.get("content-type") || "application/json")
      .send(text);
  } catch (err) {
    console.error("[payments/create]", err.message || err);
    res
      .status(502)
      .json({ success: false, message: "Payment service unavailable" });
  }
});

// Proxy: check payment status
router.get("/check/:invoiceId", async (req, res) => {
  try {
    const { invoiceId } = req.params;
    if (!/^[A-Za-z0-9_-]{4,64}$/.test(invoiceId)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid invoice id" });
    }

    const upstream = await fetch(
      `${PAY_API}/check/${encodeURIComponent(invoiceId)}?t=${Date.now()}`,
      { headers: { "Cache-Control": "no-cache" } }
    );
    const text = await upstream.text();
    res.set({
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
      "Surrogate-Control": "no-store",
    });
    res
      .status(upstream.status)
      .type(upstream.headers.get("content-type") || "application/json")
      .send(text);
  } catch (err) {
    console.error("[payments/check]", err.message || err);
    res
      .status(502)
      .json({ success: false, message: "Payment service unavailable" });
  }
});

module.exports = router;
