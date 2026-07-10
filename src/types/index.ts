export type Role = "pengurus" | "wali";
export type TransactionType = "IN" | "OUT";

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: Role;
  createdAt: Date;
}

export interface StudentData {
  id: string;
  fullName: string;
  roomNumber: string;
  currentBalance: number | string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionData {
  id: string;
  studentId: string;
  transactionDate: Date;
  description: string;
  type: TransactionType;
  amount: number | string;
  balanceAfter: number | string;
  createdAt: Date;
}

export interface GuardianStudentData {
  id: string;
  guardianId: string;
  studentId: string;
  guardian?: UserProfile;
  student?: StudentData;
}

export interface DashboardStats {
  totalStudents: number;
  totalBalance: number;
  transactionsToday: number;
  transactionsThisMonth: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface ActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export type DateFilterType = "today" | "week" | "month" | "custom";
