import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import LoginPage from '@/components/LoginPage';
import AdminDashboard from '@/components/AdminDashboard';
import StaffDashboard from '@/components/StaffDashboard';
// import CustomerPage from '@/components/CustomerPage'; // Customer page is no longer a direct navigation option
import { Toaster } from '@/components/ui/toaster';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('yamCurrentUser');
    const savedRole = localStorage.getItem('yamUserRole');
    if (savedUser && savedRole) {
      setCurrentUser(savedUser);
      setUserRole(savedRole);
    }
  }, []);

  const handleLogin = (username, role) => {
    setCurrentUser(username);
    setUserRole(role);
    localStorage.setItem('yamCurrentUser', username);
    localStorage.setItem('yamUserRole', role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole(null);
    localStorage.removeItem('yamCurrentUser');
    localStorage.removeItem('yamUserRole');
  };

  // Render content based on authentication status and user role
  const renderContent = () => {
    if (!currentUser) {
      return <LoginPage onLogin={handleLogin} />;
    }

    switch (userRole) {
      case 'admin':
        return <AdminDashboard onLogout={handleLogout} username={currentUser} />;
      case 'staff':
        return <StaffDashboard onLogout={handleLogout} username={currentUser} />;
      case 'customer':
        // If a customer logs in, redirect them or show a message,
        // as direct customer page access is being re-evaluated for security/navigation.
        // For now, let's redirect customers to a general view, or a specific message.
        // As per the request, the 'customer page link/button' is removed from navigation.
        // The CustomerPage component itself was recently modified to show inventory;
        // it can still be used if explicitly desired, but no direct *navigation* link.
        // For this prompt, let's assume if they log in as customer, they should see the public inventory.
        // For now, redirecting to Staff Dashboard for simplicity if customer role is still active,
        // or a specific component will be created if needed.
        // However, the prompt implies removing *access* as a primary role.
        // For now, let's just make it clear it's not a primary role in the App routing.
        // If a 'customer' role was somehow still active from local storage, this would log them out.
        handleLogout();
        return <LoginPage onLogin={handleLogin} />;
      default:
        return <LoginPage onLogin={handleLogin} />;
    }
  };

  return (
    <>
      <Helmet>
        <title>Y.A.M World Wide Venter - Inventory Management System</title>
        <meta name="description" content="Complete inventory management system for Y.A.M World Wide Venter with admin controls, staff management, and customer records." />
      </Helmet>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800">
        {renderContent()}
        <Toaster />
      </div>
    </>
  );
}

export default App;