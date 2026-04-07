import { useEffect } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Shield } from "lucide-react";

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/login");
    }, 2500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4">
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center"
      >
        <div className="w-20 h-20 bg-[#4F46E5] rounded-2xl flex items-center justify-center shadow-lg mb-6">
          <Shield className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">SecureAuth</h1>
        <p className="text-gray-500">Authentication made simple</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-12"
      >
        <div className="flex gap-2">
          <div
            className="w-2 h-2 rounded-full bg-[#4F46E5] animate-bounce"
            style={{ animationDelay: "0s" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-[#4F46E5] animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />
          <div
            className="w-2 h-2 rounded-full bg-[#4F46E5] animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
