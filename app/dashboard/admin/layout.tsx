import ProtectedRoute from '@/app/components/ProtectedRoute';

export default function AdminDashboard({ children }: { children: React.ReactNode }) {
    return (
        <ProtectedRoute requiredRole="admin">
            {children}
        </ProtectedRoute>
    );
}
