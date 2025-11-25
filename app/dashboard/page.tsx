'use client';

import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { useEffect } from 'react';

export default function DashboardPage() {
  const router = useRouter();
  const usuario = Cookies.get('usuario') ? JSON.parse(Cookies.get('usuario')!) : null;

  useEffect(() => {
    if (usuario?.rol === 'admin') {
      router.push('/dashboard/admin');
    } else {
      router.push('/dashboard/cliente');
    }
  }, [usuario, router]);

  return null;
}