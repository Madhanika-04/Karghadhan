// ===== User & Profile Types =====
export interface UserProfile {
  id: string;
  name: string;
  age: number;
  gender: string;
  phone: string;
  district: string;
  state: string;
  occupation: string;
  yearsOfExperience: number;
  monthlyIncome: number;
  bankAccount?: string;
  weaverIdNumber: string;
  aadhaarNumber: string;
  profileCompletion: number;
  isVerified: boolean;
  avatarUrl?: string;
  joinedDate: string;
  familyMembers: number;
  ownsLoom: boolean;
  hasExistingLoan: boolean;
  hasExistingInsurance: boolean;
  hasUPI: boolean;
  savingsHabit: 'Daily' | 'Weekly' | 'Monthly' | 'None';
  trustScore: number;
}

export type Language = {
  code: string;
  name: string;
  nativeName: string;
  greeting: string;
};

// ===== Loan Types =====
export interface Loan {
  id: string;
  name: string;
  provider: string;
  maxAmount: number;
  interestRate: string;
  processingTime: string;
  eligibility: string[];
  requiredDocuments: string[];
  benefits: string[];
  category: string;
  tags: string[];
  isEligible: boolean;
  applyUrl?: string;
}

// ===== Insurance Types =====
export interface InsurancePolicy {
  id: string;
  name: string;
  provider: string;
  coverage: string;
  annualPremium: number;
  benefits: string[];
  eligibility: string[];
  claimProcess: string[];
  type: string;
  category: 'Government' | 'Public Sector' | 'Private Sector';
  isRecommended: boolean;
  enrollmentLink?: string;
  shortDescription: string;
  suitableFor: string;
  policyPeriod: string;
  renewal: string;
  requiredDocuments: string[];
  enrollmentChannel: string;
  officialStatus: 'Active' | 'Closed' | 'Upcoming';
  aiRecommendation: string;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  category: 'Public Sector' | 'Private Sector';
  productsOffered: string[];
  suitableFor: string;
  applyThrough: string[];
  logo?: string;
}

export interface InsuranceTypeDesc {
  id: string;
  title: string;
  recommendedUsers: string;
  benefits: string[];
  commonClaims: string[];
  aiRecommendation: string;
}

// ===== Government Scheme Types =====
export interface GovtScheme {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  eligibility: string[];
  documents: string[];
  deadline?: string;
  category: string;
  ministry: string;
  isActive: boolean;
  applyUrl?: string;
}

// ===== Financial Literacy Types =====
export interface LearningModule {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedMinutes: number;
  progress: number; // 0-100
  isCompleted: boolean;
  icon: string;
  topics: string[];
  color: string;
}

// ===== AI Chat Types =====
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface SuggestedQuestion {
  id: string;
  text: string;
  category: string;
}

// ===== Notification Types =====
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  isRead: boolean;
}

// ===== Document Types =====
export interface UserDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status: 'Verified' | 'Pending' | 'Rejected';
  fileUrl: string;
  icon: string;
}

// ===== App Context Types =====
export interface AppState {
  language: Language;
  user: UserProfile | null;
  isVerified: boolean;
  notifications: Notification[];
  onboardingStep: number;
}

export interface AppContextType extends AppState {
  setLanguage: (language: Language) => void;
  setUser: (user: UserProfile) => void;
  setVerified: (verified: boolean) => void;
  markNotificationRead: (id: string) => void;
  setOnboardingStep: (step: number) => void;
}
