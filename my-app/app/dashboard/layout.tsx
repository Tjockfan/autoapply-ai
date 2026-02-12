import { ProtectedRoute } from '@/contexts/AuthContext';

export const metadata = {
  title: 'Dashboard - AutoApply AI',
  description: 'Manage your yacht crew job applications',
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ProtectedRoute>{children}</ProtectedRoute>;
}
