'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'cliente' | 'super_admin';
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = Cookies.get('token');
    const usuarioJSON = Cookies.get('usuario');

    if (!token || !usuarioJSON) {
      router.push('/login');
      return;
    }

    try {
      const usuario = JSON.parse(usuarioJSON);

      if (requiredRole) {
        // Super admin puede acceder a todo
        if (usuario.rol === 'super_admin') {
          setIsAuthorized(true);
        } 
        // Admin solo puede acceder a rutas de admin
        else if (requiredRole === 'admin' && usuario.rol === 'admin') {
          setIsAuthorized(true);
        }
        // Cliente solo puede acceder a rutas de cliente
        else if (requiredRole === 'cliente' && usuario.rol === 'cliente') {
          setIsAuthorized(true);
        }
        // Super admin solo puede acceder rutas de super_admin
        else if (requiredRole === 'super_admin' && usuario.rol !== 'super_admin') {
          router.push('/dashboard');
          return;
        }
        // Si no cumple ninguna condición, redirigir
        else {
          router.push('/dashboard');
          return;
        }
      } else {
        setIsAuthorized(true);
      }
    } catch (error) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router, requiredRole]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}