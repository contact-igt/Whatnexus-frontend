
"use client";
import { DashboardView } from '@/components/views/dashboardView';
import { SuperAdminDashboardView } from '@/components/views/superAdminDashboard/superAdminDashboardView';
import { useAuth } from '@/redux/selectors/auth/authSelector';

export default function DashboardPage() {
  const { user } = useAuth();
  const isManagement = user?.user_type === 'management';

  return isManagement ? <SuperAdminDashboardView /> : <DashboardView />;
}