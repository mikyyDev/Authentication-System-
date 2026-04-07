import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { Shield, Trash2, AlertTriangle, ChevronLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import { authApi, authStorage } from "../lib/api";
import { toast } from "sonner";

export function SettingsScreen() {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccount = async () => {
    const token = authStorage.getToken();

    if (!token) {
      toast.error("You are not logged in");
      navigate("/login");
      return;
    }

    setIsDeleting(true);

    try {
      const result = await authApi.deleteAccount(token);
      authStorage.clearToken();
      setShowDeleteDialog(false);
      toast.success(result.message);
      navigate("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Delete failed");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/me")}
            className="hover:bg-gray-100"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </Button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#4F46E5] rounded-xl flex items-center justify-center shadow-md">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>

        <Card className="mb-6 shadow-sm border-gray-100">
          <CardHeader>
            <CardTitle>Account Settings</CardTitle>
            <CardDescription>
              Manage your account preferences and settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-1">Notifications</h3>
              <p className="text-sm text-gray-500 mb-3">
                Manage your email notification preferences
              </p>
              <Button variant="outline" size="sm" className="border-gray-200">
                Configure
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-1">Privacy</h3>
              <p className="text-sm text-gray-500 mb-3">
                Control your privacy settings and data
              </p>
              <Button variant="outline" size="sm" className="border-gray-200">
                Manage
              </Button>
            </div>

            <div className="p-4 bg-gray-50 rounded-xl">
              <h3 className="font-medium text-gray-900 mb-1">Security</h3>
              <p className="text-sm text-gray-500 mb-3">
                Update password and security options
              </p>
              <Button variant="outline" size="sm" className="border-gray-200">
                Update
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-red-200 bg-red-50/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <CardTitle className="text-red-900">Danger Zone</CardTitle>
            </div>
            <CardDescription className="text-red-700">
              Irreversible actions that will permanently affect your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="p-4 bg-white rounded-xl border border-red-200">
              <h3 className="font-medium text-gray-900 mb-1">Delete Account</h3>
              <p className="text-sm text-gray-600 mb-4">
                Permanently delete your account and all associated data. This
                action cannot be undone.
              </p>
              <Button
                onClick={() => setShowDeleteDialog(true)}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="max-w-md">
          <AlertDialogHeader>
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <AlertDialogTitle className="text-center">
              Delete Account?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-center">
              This action cannot be undone. This will permanently delete your
              account and remove all your data from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:flex-col gap-2">
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700 text-white w-full"
            >
              {isDeleting ? "Deleting..." : "Yes, Delete My Account"}
            </AlertDialogAction>
            <AlertDialogCancel disabled={isDeleting} className="w-full mt-0">
              Cancel
            </AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
