import React, { useCallback, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from 'react-bootstrap';
import { getMe } from '../api/api';

function ProtectedRoute({ children }) {
  const [status, setStatus] = useState('loading');
  const location = useLocation();

  const checkAuth = useCallback(() => {
    setStatus('loading');
    getMe()
      .then((res) => {
        setStatus(res.data.authenticated ? 'authed' : 'guest');
      })
      .catch(() => setStatus('guest'));
  }, []);

  useEffect(() => {
    checkAuth();
  }, [location.pathname, checkAuth]);

  useEffect(() => {
    const onFocus = () => checkAuth();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, [checkAuth]);

  if (status === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  if (status === 'guest') {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  return children;
}

export default ProtectedRoute;
