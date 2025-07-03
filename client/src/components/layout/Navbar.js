import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User, BookOpen } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <nav style={{
      background: 'rgba(255, 255, 255, 0.95)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.1)',
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '12px 0'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Logo */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #667eea 0%, #4f63d2 100%)',
            borderRadius: '12px',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <BookOpen size={24} color="white" />
          </div>
          <h1 style={{
            background: 'linear-gradient(135deg, #667eea 0%, #4f63d2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontSize: '24px',
            fontWeight: '700',
            margin: 0
          }}>
            SchoolBag
          </h1>
        </div>

        {/* User Menu */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '8px 16px',
            background: 'rgba(102, 126, 234, 0.1)',
            borderRadius: '12px'
          }}>
            <User size={20} color="#667eea" />
            <span style={{
              color: '#667eea',
              fontWeight: '600',
              fontSize: '14px'
            }}>
              {user?.name}
            </span>
          </div>
          
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            <LogOut size={16} />
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar; 