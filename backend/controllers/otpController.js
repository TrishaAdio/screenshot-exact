const { z } = require("zod");
const User = require("../models/User");
const { sendOtpEmail, generateOtp } = require("../utils/sendOtpEmail");

const fail = (res, status, message) =>
  res.status(status).json({ success: false, message });

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const RESEND_COOLDOWN_MS = 30 * 1000; // 30s

const verifySchema = z.object({
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Enter the 6-digit code"),
});

exports.sendOtp = async (req, res) => {
  try {
    const user = await User.findById(req.user.sub).select(
      "+otp +otpExpiry +otpLastSentAt"
    );
    if (!user) return fail(res, 404, "User not found");
    if (user.isVerified) {
      return res.json({ success: true, alreadyVerified: true });
    }

    const now = Date.now();
    if (
      user.otpLastSentAt &&
      now - new Date(user.otpLastSentAt).getTime() < RESEND_COOLDOWN_MS
    ) {
      const waitMs =
        RESEND_COOLDOWN_MS - (now - new Date(user.otpLastSentAt).getTime());
      return fail(
        res,
        429,
        `Please wait ${Math.ceil(waitMs / 1000)}s before requesting another code`
      );
    }

    const code = generateOtp();
    user.otp = code;
    user.otpExpiry = new Date(now + OTP_TTL_MS);
    user.otpLastSentAt = new Date(now);
    await user.save();

    try {
      await sendOtpEmail({ to: user.email, name: user.name, code });
    } catch (err) {
      console.error("[otp/send] email API failed:", err.message || err);
      return fail(res, 502, "Failed to send verification email");
    }

    return res.json({ success: true, expiresInSec: OTP_TTL_MS / 1000 });
  } catch (err) {
    console.error("[otp/send]", err);
    return fail(res, 500, "Server error");
  }
};

exports.verifyOtp = async (req, res) => {
  const parsed = verifySchema.safeParse(req.body);
  if (!parsed.success)
    return fail(res, 400, parsed.error.issues[0]?.message || "Invalid input");

  const { code } = parsed.data;
  try {
    const user = await User.findById(req.user.sub).select(
      "+otp +otpExpiry"
    );
    if (!user) return fail(res, 404, "User not found");
    if (user.isVerified) {
      return res.json({ success: true, user: user.toSafeJSON() });
    }
    if (!user.otp || !user.otpExpiry) {
      return fail(res, 400, "No code requested. Send a new code.");
    }
    if (Date.now() > new Date(user.otpExpiry).getTime()) {
      return fail(res, 400, "Code expired. Request a new one.");
    }
    if (String(user.otp) !== code) {
      return fail(res, 400, "Incorrect code");
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    user.otpLastSentAt = undefined;
    await user.save();

    return res.json({ success: true, user: user.toSafeJSON() });
  } catch (err) {
    console.error("[otp/verify]", err);
    return fail(res, 500, "Server error");
  }
};
