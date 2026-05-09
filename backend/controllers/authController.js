const { z } = require("zod");
const User = require("../models/User");
const Order = require("../models/Order");
const { signToken } = require("../config/jwt");
const { sendOtpEmail, generateOtp } = require("../utils/sendOtpEmail");

const OTP_TTL_MS = 10 * 60 * 1000;

const signupSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(100),
  email: z.string().trim().toLowerCase().email("Invalid email").max(255),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Invalid email").max(255),
  password: z.string().min(1, "Password is required").max(128),
});

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

exports.signup = async (req, res) => {
  const parsed = signupSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, parsed.error.issues[0]?.message || "Invalid input");

  const { name, password } = parsed.data;
  // Normalize once and reuse so the lookup and the insert use identical values.
  const email = parsed.data.email.trim().toLowerCase();

  try {
    const existing = await User.findOne({ email }).collation({
      locale: "en",
      strength: 2,
    });
    if (existing) return fail(res, 409, "Email is already registered");

    const user = await User.create({ name, email, password });

    // Auto-send OTP — non-blocking failure (signup still succeeds).
    try {
      const code = generateOtp();
      user.otp = code;
      user.otpExpiry = new Date(Date.now() + OTP_TTL_MS);
      user.otpLastSentAt = new Date();
      await user.save();
      await sendOtpEmail({ to: user.email, name: user.name, code });
    } catch (otpErr) {
      console.error("[signup] OTP send failed:", otpErr.message || otpErr);
    }

    const token = signToken({ sub: user._id.toString(), email: user.email });

    return res
      .status(201)
      .json({ success: true, token, user: user.toSafeJSON() });
  } catch (err) {
    if (err && err.code === 11000) {
      // Only report "email taken" when the duplicate is actually on email.
      const dupField = err.keyPattern ? Object.keys(err.keyPattern)[0] : null;
      if (dupField === "email") {
        return fail(res, 409, "Email is already registered");
      }
      console.error("[signup] duplicate key on field:", dupField, err.keyValue);
      return fail(
        res,
        409,
        `Duplicate value for field "${dupField}". Drop the stale unique index in MongoDB.`
      );
    }
    console.error("[signup]", err);
    return fail(res, 500, "Server error");
  }
};

exports.login = async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, parsed.error.issues[0]?.message || "Invalid input");

  const { email, password } = parsed.data;
  try {
    const user = await User.findOne({ email }).select("+password");
    if (!user) return fail(res, 401, "Invalid email or password");
    const ok = await user.comparePassword(password);
    if (!ok) return fail(res, 401, "Invalid email or password");

    const token = signToken({ sub: user._id.toString(), email: user.email });
    return res.json({ success: true, token, user: user.toSafeJSON() });
  } catch (err) {
    console.error("[login]", err);
    return fail(res, 500, "Server error");
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.user.sub);
    if (!user) return fail(res, 404, "User not found");
    return res.json({ success: true, user: user.toSafeJSON() });
  } catch (err) {
    console.error("[me]", err);
    return fail(res, 500, "Server error");
  }
};
