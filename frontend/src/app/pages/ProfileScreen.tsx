import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Shield, Mail, User, Settings, LogOut } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { authApi, authStorage, type UserResponse } from "../lib/api";
import { toast } from "sonner";

export function ProfileScreen() {
  const navigate = useNavigate();
  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = authStorage.getToken();

    if (!token) {
      navigate("/login");
      return;
    }

    const loadUser = async () => {
      try {
        const data = await authApi.me(token);
        setUser(data);
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Failed to load profile",
        );
        authStorage.clearToken();
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [navigate]);

  const handleLogout = () => {
    authStorage.clearToken();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#4F46E5] rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-gray-100"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
          </Button>
        </div>

        <Card className="mb-6 shadow-sm border-gray-100">
          <CardHeader className="pb-3">
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-gray-900 font-medium">{user.name}</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Mail className="w-5 h-5 text-gray-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-500">Email Address</p>
                <p className="text-gray-900 font-medium">{user.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Account Status</span>
              <span className="text-gray-900 font-medium">Active</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">User ID</span>
              <span className="text-gray-900 font-medium">{user.id}</span>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-3">
          <Button
            onClick={() => navigate("/settings")}
            variant="outline"
            className="w-full h-12 justify-start gap-3 border-gray-200 hover:bg-gray-50"
          >
            <Settings className="w-5 h-5 text-gray-600" />
            <span>Account Settings</span>
          </Button>

          <Button
            onClick={handleLogout}
            variant="outline"
            className="w-full h-12 justify-start gap-3 border-gray-200 hover:bg-gray-50"
          >
            <LogOut className="w-5 h-5 text-gray-600" />
            <span>Logout</span>
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
