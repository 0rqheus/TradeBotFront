import React from 'react';
import { Navigate } from 'react-router-dom';

export default function IsLoggedIn({ children }: { children: JSX.Element }) {
  if (localStorage.user) {
    const token: string = JSON.parse(localStorage.user).token;
    if (!token) {
      return <Navigate to="/" />;
    }
  }

  return children;
}
