import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Lock, Save, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const ChangePasswordModal = ({ onClose, userRole, username }) => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const { toast } = useToast();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Fetch stored credentials
    const creds = JSON.parse(localStorage.getItem('yamCredentials') || '{}');
    const userCreds = creds[userRole];

    if (!userCreds) {
      setError('System error: User credentials not found.');
      return;
    }

    // Verify current password
    if (formData.currentPassword !== userCreds.password) {
      setError('Current password is incorrect.');
      return;
    }

    // Validate new password
    if (formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    // Confirm match
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    // Update password
    creds[userRole].password = formData.newPassword;
    localStorage.setItem('yamCredentials', JSON.stringify(creds));

    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully."
    });
    
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100]">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-900 rounded-xl shadow-2xl max-w-md w-full border border-white/10 overflow-hidden"
      >
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div className="flex items-center gap-2 text-white">
            <Lock className="w-5 h-5 text-blue-400" />
            <h2 className="font-bold">Change Password</h2>
          </div>
          <Button
            onClick={onClose}
            variant="ghost"
            size="sm"
            className="text-white/50 hover:text-white hover:bg-white/10 rounded-full h-8 w-8 p-0"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1.5">Current Password</label>
            <input
              type="password"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter current password"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1.5">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Enter new password (min. 6 chars)"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-blue-200 mb-1.5">Confirm New Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2.5 rounded-lg bg-black/20 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              placeholder="Re-enter new password"
              required
            />
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3 rounded-lg text-sm flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="pt-2 flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 border-white/10 text-white hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-500 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Update Password
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ChangePasswordModal;