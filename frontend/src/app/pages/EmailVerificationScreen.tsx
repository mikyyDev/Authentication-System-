import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import { motion } from "motion/react";
import { Shield, CheckCircle2 } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "../components/ui/input-otp";
import { authApi } from "../lib/api";
import { toast } from "sonner";

export function EmailVerificationScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email || "";
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleVerify = async () => {
    if (!email) {
      toast.error("Email is missing. Please register again.");
      navigate("/register");
      return;
    }

    if (otp.length !== 6) {
      toast.error("Please enter a 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      await authApi.verify({ email, code: otp });
      setIsSuccess(true);
      toast.success("Email verified successfully!");
      setTimeout(() => {
        navigate("/login", { state: { email } });
      }, 1200);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Verification failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Email is missing. Please register again.");
      return;
    }

    try {
      const result = await authApi.sendCode({ email });
      toast.success(result.message);
      if (result.code) {
        toast.info(`Use this code: ${result.code}`);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Resend failed");
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="text-center"
        >
          <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Verified!</h2>
          <p className="text-gray-500">
            Your email has been verified successfully
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-[#4F46E5] rounded-xl flex items-center justify-center shadow-md mb-4">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Verify Your Email
          </h1>
          <p className="text-gray-500 mt-1 text-center">
            We sent a 6-digit code to{" "}
            <span className="font-medium">{email}</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="space-y-6">
            <div className="flex flex-col items-center space-y-4">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup className="gap-2">
                  <InputOTPSlot index={0} className="w-12 h-14 text-xl" />
                  <InputOTPSlot index={1} className="w-12 h-14 text-xl" />
                  <InputOTPSlot index={2} className="w-12 h-14 text-xl" />
                  <InputOTPSlot index={3} className="w-12 h-14 text-xl" />
                  <InputOTPSlot index={4} className="w-12 h-14 text-xl" />
                  <InputOTPSlot index={5} className="w-12 h-14 text-xl" />
                </InputOTPGroup>
              </InputOTP>
            </div>

            <Button
              onClick={handleVerify}
              disabled={isLoading || otp.length !== 6}
              className="w-full h-12 bg-[#4F46E5] hover:bg-[#4338CA] text-white"
            >
              {isLoading ? "Verifying..." : "Verify Email"}
            </Button>

            <div className="text-center">
              <p className="text-gray-600 text-sm">
                Didn't receive the code?{" "}
                <button
                  onClick={handleResend}
                  className="text-[#4F46E5] hover:underline font-medium"
                >
                  Resend
                </button>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
          <p className="text-sm text-gray-600 text-center">
            <strong>Tip:</strong> In demo mode, the code appears in a toast.
          </p>
        </div>

        <button
          onClick={() => navigate("/login")}
          className="mt-4 w-full text-center text-gray-600 hover:text-gray-900"
        >
          ← Back to Login
        </button>
      </motion.div>
    </div>
  );
}
