export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: 'student' | 'recruiter' | 'admin';
  status: 'active' | 'inactive' | 'suspended';
  registrationDate: string;
  lastLogin?: string;
  credits: number;
}

export interface CV {
  id: string;
  userId: string;
  userName: string;
  title: string;
  status: 'active' | 'pending' | 'rejected';
  createdAt: string;
  updatedAt: string;
  views: number;
  downloads: number;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'internship';
  status: 'active' | 'closed' | 'draft';
  applications: number;
  createdAt: string;
  salary?: string;
  recruiterId: string;
}

export interface Interview {
  id: string;
  candidateId: string;
  candidateName: string;
  jobId: string;
  jobTitle: string;
  scheduledAt: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  score?: number;
  feedback?: string;
  duration?: number;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'purchase' | 'refund' | 'bonus';
  amount: number;
  credits: number;
  status: 'completed' | 'pending' | 'failed';
  createdAt: string;
  paymentMethod?: string;
}

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalJobs: number;
  activeJobs: number;
  totalCVs: number;
  totalInterviews: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface ChartData {
  date: string;
  users: number;
  jobs: number;
  revenue: number;
}
