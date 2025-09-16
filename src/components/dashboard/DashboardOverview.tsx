'use client';

import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { useDashboardData } from '@/hooks/useDashboard';

export default function DashboardOverview() {
  const { 
    metrics, 
    recentActivity, 
    highRiskPatients, 
    isLoading, 
    error, 
    refetch 
  } = useDashboardData();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'confirmed': return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'cancelled': return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'in-progress': return 'bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium';
      default: return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'high': return 'bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'medium': return 'bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium';
      case 'low': return 'bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium';
      default: return 'bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-medium';
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card title="Error Loading Dashboard">
          <div className="text-center py-8">
            <p className="text-red-600 mb-4">Failed to load dashboard data</p>
            <p className="text-sm text-gray-600 mb-4">{error.message}</p>
            <Button onClick={refetch} variant="primary">
              🔄 Retry
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Healthcare Dashboard</h1>
        <Button onClick={refetch} variant="secondary">
          🔄 Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card title="Total Patients">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{metrics.totalPatients}</div>
              <p className="text-sm text-gray-600">Active patient records</p>
            </div>
            <div className="text-3xl">👤</div>
          </div>
        </Card>

        <Card title="Today's Appointments">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{metrics.todaysAppointments}</div>
              <p className="text-sm text-gray-600">Scheduled for today</p>
            </div>
            <div className="text-3xl">📅</div>
          </div>
        </Card>

        <Card title="Pending Appointments">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-2xl font-bold text-gray-900">{metrics.pendingAppointments}</div>
              <p className="text-sm text-gray-600">Awaiting confirmation</p>
            </div>
            <div className="text-3xl">⏰</div>
          </div>
        </Card>
      </div>

      {/* Recent Activity and High-Risk Patients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card title="📝 Recent Activity">
          <div className="space-y-4">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{activity.title}</p>
                    <p className="text-xs text-gray-600">{activity.subtitle}</p>
                    <p className="text-xs text-gray-500">{activity.time}</p>
                  </div>
                  {activity.status && (
                    <span className={getStatusColor(activity.status)}>
                      {activity.status}
                    </span>
                  )}
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent activity</p>
            )}
          </div>
        </Card>

        {/* High-Risk Patients */}
        <Card title="❤️ Patient Risk Overview">
          <div className="space-y-4">
            {highRiskPatients.length > 0 ? (
              highRiskPatients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{patient.name}</p>
                    <p className="text-xs text-gray-600">
                      {patient.gender} • Born {new Date(patient.birthDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={getRiskColor(patient.riskLevel)}>
                    {patient.riskLevel} risk
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No patient data available</p>
            )}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card title="Quick Actions">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="secondary" className="h-20 flex flex-col items-center justify-center">
            <div className="text-2xl mb-2">👤</div>
            <span className="text-sm">Add Patient</span>
          </Button>
          <Button variant="secondary" className="h-20 flex flex-col items-center justify-center">
            <div className="text-2xl mb-2">📅</div>
            <span className="text-sm">Schedule Appointment</span>
          </Button>
          <Button variant="secondary" className="h-20 flex flex-col items-center justify-center">
            <div className="text-2xl mb-2">📝</div>
            <span className="text-sm">Clinical Notes</span>
          </Button>
          <Button variant="secondary" className="h-20 flex flex-col items-center justify-center">
            <div className="text-2xl mb-2">📊</div>
            <span className="text-sm">View Reports</span>
          </Button>
        </div>
      </Card>
    </div>
  );
}
