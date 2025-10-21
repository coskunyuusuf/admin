// API Response Types
export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User Types
export interface User {
  username: string;
  full_name?: string;
  email?: string;
  phone?: string;
  bio?: string;
  avatar_url?: string;
  roles: string[];
  created_at: string;
  updated_at?: string;
  // Instructor fields
  title?: string;
  department?: string;
  specialization?: string[];
  office_location?: string;
  office_hours?: string;
  // Student fields
  student_id?: string;
  grade_level?: string;
  major?: string;
  enrollment_year?: number;
  // Social links
  social_links?: {
    linkedin?: string;
    github?: string;
  };
  // Preferences
  preferences?: {
    theme?: string;
    language?: string;
    notifications?: boolean;
  };
  // Badges
  awarded_badges?: string[];
}

// Authentication Types
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  ok: boolean;
  username: string;
  token: string;
  roles: string[];
  awarded_badges: string[];
}

export interface RegisterCredentials {
  username: string;
  password: string;
}

// Dashboard Types
export interface DashboardStats {
  study_time: {
    total: string;
    week_change: string;
  };
  quizzes: {
    total: number;
    week_change: string;
  };
  badges: {
    total: number;
    week_change: string;
  };
}

export interface DashboardPoints {
  current_week: number;
  current_month: number;
  total: number;
  rank: number;
}

export interface DashboardData {
  user: User;
  stats: DashboardStats;
  points: DashboardPoints;
  leaderboard: any[];
  weekly_progress: Record<string, number>;
}

// Activity Types
export interface Activity {
  id: number;
  type: string;
  description: string;
  user: string;
  created_at: string;
}

// System Stats Types
export interface SystemStats {
  total_users: number;
  users_this_week: number;
  active_sessions: number;
  sessions_today: number;
  total_questions: number;
  questions_this_week: number;
  users_active_today: number;
  users_active_week: number;
  new_registrations: number;
}

export interface APIStats {
  total_requests: number;
  requests_today: number;
  avg_response_time: number;
  error_rate: number;
  success_rate: number;
}

// Points Types
export interface UserPoints {
  username: string;
  full_name: string;
  total_points: number;
  weekly_points: number;
  monthly_points: number;
}

export interface PointsBreakdown {
  sessions: number;
  quizzes: number;
  resources: number;
}

export interface PointsProgress {
  target: number;
  achieved: number;
  percentage: number;
}

export interface PointsData {
  total: number;
  current_week: number;
  current_month: number;
  weekly_breakdown: PointsBreakdown;
  weekly_progress: PointsProgress;
}

// Badge Types
export interface Badge {
  id: string;
  name: string;
  description: string;
  category: string;
  awarded_count?: number;
}

export interface BadgeProgress {
  quiz_attempts: number;
  sessions_count: number;
  focus_hours: number;
}

export interface BadgeData {
  badges: string[];
  progress: BadgeProgress;
  all_badges: Record<string, Badge>;
}

// Chart Data Types
export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  tension?: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

// Form Types
export interface Profile {
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  bio?: string;
}

export interface ProfileForm {
  full_name: string;
  email: string;
  phone?: string;
  department?: string;
  bio?: string;
}

export interface PreferencesForm {
  theme: string;
  language: string;
  timezone: string;
}

export interface PasswordChangeForm {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

// Modal Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface UserModalProps extends ModalProps {
  user?: User | null;
  mode: 'view' | 'edit' | 'create';
}

// Component Props Types
export interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative';
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

export interface ChartProps {
  data: ChartData;
  title?: string;
  height?: number;
}

export interface RecentActivityProps {
  activities: Activity[];
}

// API Error Types
export interface APIError {
  detail: string;
  status_code: number;
}

// Utility Types
export type Role = 'admin' | 'instructor' | 'student';
export type Theme = 'light' | 'dark' | 'auto';
export type Language = 'tr' | 'en';
export type Timezone = 'Europe/Istanbul' | 'UTC' | 'America/New_York';