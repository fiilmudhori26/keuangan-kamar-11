export const APP_NAME = "Keuangan Santri";
export const APP_DESCRIPTION = "Sistem Manajemen Keuangan Santri Pesantren";

export const ROLES = {
  PENGURUS: "pengurus",
  WALI: "wali",
} as const;

export const TRANSACTION_TYPES = {
  IN: "IN",
  OUT: "OUT",
} as const;

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/dashboard",
  STUDENTS: "/students",
  STUDENT_NEW: "/students/new",
  STUDENT_DETAIL: (id: string) => `/students/${id}`,
  TRANSACTIONS: "/transactions",
  GUARDIANS: "/guardians",
  PORTAL: "/portal",
} as const;

export const ITEMS_PER_PAGE = 50;
