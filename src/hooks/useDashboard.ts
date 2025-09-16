import { useQuery } from '@tanstack/react-query';

interface DashboardMetrics {
  totalPatients: number;
  todaysAppointments: number;
  pendingAppointments: number;
  activeConditions: number;
  recentEncounters: number;
}

interface RecentActivity {
  id: string;
  type: 'appointment' | 'encounter' | 'condition' | 'patient';
  title: string;
  subtitle: string;
  time: string;
  status?: string;
}

interface DashboardPatient {
  id: string;
  name: string;
  gender: string;
  birthDate: string;
  riskLevel: 'low' | 'medium' | 'high';
}

export const useDashboardData = () => {
  const { data: patients = [], isLoading: patientsLoading, error: patientsError, refetch: refetchPatients } = useQuery({
    queryKey: ['dashboard-patients'],
    queryFn: async () => {
      const response = await fetch('/api/patients?_count=20');
      if (!response.ok) {
        throw new Error('Failed to fetch patients');
      }
      const data = await response.json();
      return data.entry?.map((entry: any) => entry.resource) || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const { data: appointments = [], isLoading: appointmentsLoading, error: appointmentsError, refetch: refetchAppointments } = useQuery({
    queryKey: ['dashboard-appointments'],
    queryFn: async () => {
      const response = await fetch('/api/appointments?_count=20');
      if (!response.ok) {
        throw new Error('Failed to fetch appointments');
      }
      const data = await response.json();
      return data.entry?.map((entry: any) => entry.resource) || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });

  const encounters: any[] = [];

  const isLoading = patientsLoading || appointmentsLoading;
  const error = patientsError || appointmentsError;

  const metrics: DashboardMetrics = {
    totalPatients: patients.length,
    todaysAppointments: 0,
    pendingAppointments: 0,
    activeConditions: 0,
    recentEncounters: encounters.length
  };

  const today = new Date().toISOString().split('T')[0];
  metrics.todaysAppointments = appointments.filter((appointment: any) => 
    appointment.start?.startsWith(today)
  ).length;

  metrics.pendingAppointments = appointments.filter((appointment: any) => 
    appointment.status === 'pending'
  ).length;

  metrics.activeConditions = 0;

  const recentActivity: RecentActivity[] = [];

  appointments.slice(0, 3).forEach((appointment: any) => {
    recentActivity.push({
      id: appointment.id,
      type: 'appointment',
      title: `Appointment ${appointment.status}`,
      subtitle: `Patient: ${appointment.participant?.[0]?.actor?.display || appointment.participant?.[0]?.actor?.reference || 'Unknown'}`,
      time: new Date(appointment.start).toLocaleString(),
      status: appointment.status
    });
  });

  const highRiskPatients: DashboardPatient[] = patients.slice(0, 3).map((patient: any) => {
    const birthDate = new Date(patient.birthDate);
    const age = new Date().getFullYear() - birthDate.getFullYear();
    const riskLevel: 'low' | 'medium' | 'high' = age > 65 ? 'high' : age > 45 ? 'medium' : 'low';
    
    const name = patient.name?.[0] 
      ? `${patient.name[0].given?.join(' ') || ''} ${patient.name[0].family || ''}`.trim()
      : 'Unknown Patient';
    
    return {
      id: patient.id,
      name,
      gender: patient.gender,
      birthDate: patient.birthDate,
      riskLevel
    };
  });

  return {
    metrics,
    recentActivity: recentActivity.slice(0, 5),
    highRiskPatients,
    isLoading,
    error,
    refetch: () => {
      refetchPatients();
      refetchAppointments();
    }
  };
};
