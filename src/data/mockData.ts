import { User, CV, Job, Interview, Transaction, DashboardStats, ChartData } from '../types/admin';

// Mock data for users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Juan Pérez',
    email: 'juan.perez@email.com',
    avatar: '/avatars/user1.jpg',
    role: 'student',
    status: 'active',
    registrationDate: '2024-01-15',
    lastLogin: '2024-06-10',
    credits: 150
  },
  {
    id: '2',
    name: 'María García',
    email: 'maria.garcia@empresa.com',
    avatar: '/avatars/user2.jpg',
    role: 'recruiter',
    status: 'active',
    registrationDate: '2024-02-20',
    lastLogin: '2024-06-12',
    credits: 300
  },
  {
    id: '3',
    name: 'Carlos Rodríguez',
    email: 'carlos.rodriguez@email.com',
    role: 'student',
    status: 'inactive',
    registrationDate: '2024-03-10',
    lastLogin: '2024-05-15',
    credits: 50
  },
  {
    id: '4',
    name: 'Ana López',
    email: 'ana.lopez@startup.com',
    avatar: '/avatars/user4.jpg',
    role: 'recruiter',
    status: 'active',
    registrationDate: '2024-04-05',
    lastLogin: '2024-06-13',
    credits: 200
  },
  {
    id: '5',
    name: 'Pedro Sánchez',
    email: 'pedro.sanchez@email.com',
    role: 'student',
    status: 'suspended',
    registrationDate: '2024-05-01',
    credits: 0
  }
];

// Mock data for CVs
export const mockCVs: CV[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Juan Pérez',
    title: 'Desarrollador Frontend Junior',
    status: 'active',
    createdAt: '2024-05-01',
    updatedAt: '2024-06-01',
    views: 45,
    downloads: 12
  },
  {
    id: '2',
    userId: '3',
    userName: 'Carlos Rodríguez',
    title: 'Analista de Datos',
    status: 'pending',
    createdAt: '2024-05-15',
    updatedAt: '2024-05-15',
    views: 23,
    downloads: 5
  },
  {
    id: '3',
    userId: '1',
    userName: 'Juan Pérez',
    title: 'Desarrollador Full Stack',
    status: 'active',
    createdAt: '2024-06-01',
    updatedAt: '2024-06-10',
    views: 78,
    downloads: 25
  }
];

// Mock data for jobs
export const mockJobs: Job[] = [
  {
    id: '1',
    title: 'Desarrollador React Senior',
    company: 'TechCorp',
    location: 'Madrid, España',
    type: 'full-time',
    status: 'active',
    applications: 15,
    createdAt: '2024-05-20',
    salary: '40.000 - 55.000 €',
    recruiterId: '2'
  },
  {
    id: '2',
    title: 'Diseñador UX/UI',
    company: 'Creative Studio',
    location: 'Barcelona, España',
    type: 'contract',
    status: 'active',
    applications: 8,
    createdAt: '2024-06-01',
    salary: '35.000 - 45.000 €',
    recruiterId: '4'
  },
  {
    id: '3',
    title: 'Analista de Datos',
    company: 'DataTech',
    location: 'Valencia, España',
    type: 'full-time',
    status: 'closed',
    applications: 25,
    createdAt: '2024-04-15',
    salary: '30.000 - 40.000 €',
    recruiterId: '2'
  }
];

// Mock data for interviews
export const mockInterviews: Interview[] = [
  {
    id: '1',
    candidateId: '1',
    candidateName: 'Juan Pérez',
    jobId: '1',
    jobTitle: 'Desarrollador React Senior',
    scheduledAt: '2024-06-15T10:00:00Z',
    status: 'scheduled',
    score: undefined,
    duration: 45
  },
  {
    id: '2',
    candidateId: '3',
    candidateName: 'Carlos Rodríguez',
    jobId: '3',
    jobTitle: 'Analista de Datos',
    scheduledAt: '2024-06-10T14:00:00Z',
    status: 'completed',
    score: 85,
    feedback: 'Excelente candidato, muy preparado técnicamente.',
    duration: 60
  },
  {
    id: '3',
    candidateId: '1',
    candidateName: 'Juan Pérez',
    jobId: '2',
    jobTitle: 'Diseñador UX/UI',
    scheduledAt: '2024-06-08T09:00:00Z',
    status: 'no-show'
  }
];

// Mock data for transactions
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    userId: '1',
    userName: 'Juan Pérez',
    type: 'purchase',
    amount: 19.99,
    credits: 100,
    status: 'completed',
    createdAt: '2024-06-01',
    paymentMethod: 'Tarjeta de crédito'
  },
  {
    id: '2',
    userId: '2',
    userName: 'María García',
    type: 'purchase',
    amount: 49.99,
    credits: 300,
    status: 'completed',
    createdAt: '2024-06-05',
    paymentMethod: 'PayPal'
  },
  {
    id: '3',
    userId: '4',
    userName: 'Ana López',
    type: 'purchase',
    amount: 29.99,
    credits: 200,
    status: 'pending',
    createdAt: '2024-06-12',
    paymentMethod: 'Transferencia bancaria'
  },
  {
    id: '4',
    userId: '1',
    userName: 'Juan Pérez',
    type: 'bonus',
    amount: 0,
    credits: 50,
    status: 'completed',
    createdAt: '2024-05-15'
  }
];

// Mock dashboard stats
export const mockDashboardStats: DashboardStats = {
  totalUsers: 1247,
  activeUsers: 892,
  totalJobs: 156,
  activeJobs: 89,
  totalCVs: 3421,
  totalInterviews: 567,
  totalRevenue: 45678.90,
  monthlyRevenue: 8934.50
};

// Mock chart data
export const mockChartData: ChartData[] = [
  { date: '2024-01', users: 120, jobs: 45, revenue: 2340 },
  { date: '2024-02', users: 180, jobs: 62, revenue: 3567 },
  { date: '2024-03', users: 220, jobs: 78, revenue: 4321 },
  { date: '2024-04', users: 285, jobs: 89, revenue: 5678 },
  { date: '2024-05', users: 340, jobs: 95, revenue: 6789 },
  { date: '2024-06', users: 102, jobs: 23, revenue: 1890 }
];
