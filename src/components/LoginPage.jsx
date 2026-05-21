import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const LoginPage = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginType, setLoginType] = useState('admin');
  const { toast } = useToast();

  useEffect(() => {
    // Initialize default credentials in localStorage if they don't exist
    const existingCreds = localStorage.getItem('yamCredentials');
    if (!existingCreds) {
      const defaultCreds = {
        admin: {
          username: 'admin',
          password: 'Admin123'
        },
        staff: {
          username: 'Staff',
          password: 'Staff123'
        }
      };
      localStorage.setItem('yamCredentials', JSON.stringify(defaultCreds));
    }
  }, []);

  const handleLogin = e => {
    e.preventDefault();
    if (loginType === 'customer') {
      onLogin('customer', 'customer');
      toast({
        title: "Welcome!",
        description: "Accessing customer portal..."
      });
      return;
    }

    const storedCreds = JSON.parse(localStorage.getItem('yamCredentials') || '{}');
    const cred = storedCreds[loginType];

    if (cred && username === cred.username && password === cred.password) {
      onLogin(username, loginType);
      toast({
        title: "Login Successful",
        description: `Welcome, ${loginType === 'admin' ? 'C.E.O.' : 'Staff Member'}!`
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid username or password",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="w-full max-w-md"
      >
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl p-8 border border-white/20">
          <div className="flex flex-col items-center mb-8">
            <div className="mb-4 bg-white/10 rounded-full p-2">
              <img src="https://horizons-cdn.hostinger.com/f8aba79f-60b9-413d-b971-e48e97627679/5fc8119d1382941996f04918d1bdfe78.png" alt="Y.A.M Logo" className="w-32 h-32 object-contain rounded-full" />
            </div>
            <h1 className="text-3xl font-bold text-white text-center">Y.A.M World Wide Venture</h1>
            <p className="text-blue-200 text-center mt-2 text-sm font-medium">
              No. 01 Na'ibawa Fly Over, Zaria Road,<br />Kano State Nigeria
            </p>
            <div className="w-16 h-1 bg-blue-500/50 rounded-full mt-4 mb-2"></div>
            <p className="text-blue-100 text-sm uppercase tracking-wider">Y.A.M RECORD SYSTEM</p>
          </div>

          <div className="flex gap-2 mb-6">
            <Button type="button" onClick={() => setLoginType('admin')} className={`flex-1 ${loginType === 'admin' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/20 hover:bg-white/30'} transition-all`}>
              Admin
            </Button>
            <Button type="button" onClick={() => setLoginType('staff')} className={`flex-1 ${loginType === 'staff' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-white/20 hover:bg-white/30'} transition-all`}>
              Staff
            </Button>
          </div>

          {loginType !== 'customer' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Username</label>
                <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Enter username" required />
              </div>
              <div>
                <label className="block text-white mb-2 text-sm font-medium">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all" placeholder="Enter password" required />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
                <LogIn className="w-5 h-5 mr-2" />
                Login as {loginType === 'admin' ? 'Admin' : 'Staff'}
              </Button>
            </form>
          ) : (
            <Button onClick={handleLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-all transform hover:scale-105">
              <Users className="w-5 h-5 mr-2" />
              Continue to Customer Portal
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default LoginPage;
