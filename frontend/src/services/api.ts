import axios from 'axios';
import type { UserProfile, Loan, InsurancePolicy } from '../types';


const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('auth_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle global errors like 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if unauthorized
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_profile');
      window.dispatchEvent(new Event('auth_unauthorized'));
    }
    return Promise.reject(error);
  }
);

// WEAVERS API
export const weaverApi = {
  getProfile: async (weaverId: string) => {
    if (weaverId === 'weaver-demo-001') return { id: weaverId, name: 'Ramesh Kumar', phone_number: '+919876543210' };
    const response = await api.get(`/weavers/${weaverId}`);
    return response.data;
  },
  updateProfile: async (weaverId: string, data: Partial<UserProfile>) => {
    const response = await api.put(`/weavers/${weaverId}`, data);
    return response.data;
  },
  applyCredentials: async (weaverId: string, stateCode: string = 'UP') => {
    if (weaverId === 'weaver-demo-001') return { status: 'success', pehchan_id: 'PEH-UP-2024-8842' };
    const response = await api.post(`/weavers/${weaverId}/apply-credentials`, null, {
      params: { state_code: stateCode },
    });
    return response.data;
  },
};

// FINANCE API
export const financeApi = {
  getSummary: async (weaverId: string) => {
    if (weaverId === 'weaver-demo-001') return { score: 765, active_loans: [], insurance_policies: [] };
    const response = await api.get(`/finance/summary/${weaverId}`);
    return response.data;
  },
  enrollInsurance: async (weaverId: string, policyName: string) => {
    const response = await api.post(`/finance/insurance/enroll`, {
      weaver_id: weaverId,
      policy_name: policyName,
    });
    return response.data;
  },
  processPayout: async (weaverId: string, grossAmount: number) => {
    const response = await api.post(`/finance/payout/process`, {
      weaver_id: weaverId,
      gross_saree_payout: grossAmount,
    });
    return response.data;
  },
};

// LOAN API
export const loanApi = {
  getLoans: async (weaverId: string) => {
    if (weaverId === 'weaver-demo-001') return [];
    const response = await api.get(`/loans/${weaverId}`);
    return response.data;
  },
  applyForLoan: async (weaverId: string, amount: number, tenure: number, assessmentId?: string) => {
    const response = await api.post(`/loans/apply`, {
      weaver_id: weaverId,
      requested_amount: amount,
      tenure_months: tenure,
      assessment_id: assessmentId,
    });
    return response.data;
  },
};

// FINANCIAL PRODUCTS API
export const productsApi = {
  getRecommendations: async (weaverId: string) => {
    if (weaverId === 'weaver-demo-001') return { recommended_savings: [], recommended_loans: [] };
    const response = await api.get(`/financial-products/recommendations/${weaverId}`);
    return response.data;
  },
  applyPortal: async (weaverId: string, productId: string, formData: any) => {
    const response = await api.post(`/financial-products/apply-portal`, {
      weaver_id: weaverId,
      product_id: productId,
      form_data: formData,
    });
    return response.data;
  },
  // alias used in LoansPage
  applyForPortalProduct: async (weaverId: string, productId: string, formData: any) => {
    const response = await api.post(`/financial-products/apply-portal`, {
      weaver_id: weaverId,
      product_id: productId,
      form_data: formData,
    });
    return response.data;
  },
};

// ---------------------------------------------------------------------------
// AUTHENTICATION API
// ---------------------------------------------------------------------------
export const authApi = {
  login: async (credentials: any) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },
  register: async (data: any) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  getMe: async (userId?: string) => {
    const params = userId ? { user_id: userId } : {};
    const response = await api.get('/auth/me', { params });
    return response.data;
  }
};

// ---------------------------------------------------------------------------
// CREDIT SCORING API
// ---------------------------------------------------------------------------
export const creditScoringApi = {
  calculateScore: async (data: any) => {
    const response = await api.post('/score/calculate', data);
    return response.data;
  },
  fetchEDhaga: async (data: any) => {
    const response = await api.post('/score/edhaga-fetch', data);
    return response.data;
  },
  uploadPassbook: async (formData: FormData) => {
    const response = await api.post('/score/passbook-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getScoringProfile: async (weaverId: string) => {
    const response = await api.get(`/score/${weaverId}`);
    return response.data;
  }
};

// ---------------------------------------------------------------------------
// TRANSACTIONS API
// ---------------------------------------------------------------------------
export const transactionsApi = {
  getTransactions: async (weaverId: string) => {
    const response = await api.get(`/transactions/weaver/${weaverId}`);
    return response.data;
  },
  addTransaction: async (weaverId: string, data: any) => {
    const response = await api.post(`/transactions/weaver/${weaverId}`, data);
    return response.data;
  },
  deleteTransaction: async (transactionId: string) => {
    const response = await api.delete(`/transactions/${transactionId}`);
    return response.data;
  }
};

// ---------------------------------------------------------------------------
// VERIFICATION API
// ---------------------------------------------------------------------------
export const verificationApi = {
  uploadDocument: async (weaverId: string, docType: string, formData: FormData) => {
    const response = await api.post(`/verification/${weaverId}/upload/${docType}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },
  getDocuments: async (weaverId: string) => {
    const response = await api.get(`/verification/${weaverId}/documents`);
    return response.data;
  },
  checkStatus: async (weaverId: string) => {
    const response = await api.get(`/verification/${weaverId}/status`);
    return response.data;
  }
};

// ---------------------------------------------------------------------------
// AGENTS API — all 7 specialized domain agents
// Each method accepts a user_details object (weaver financial context) and an
// optional free-text message.  Returns the raw axios response so callers can
// access .data directly.
// ---------------------------------------------------------------------------
const getAppLanguage = () => {
  const code = localStorage.getItem('i18nextLng') || 'en';
  const langMap: Record<string, string> = {
    en: 'English',
    hi: 'Hindi',
    ta: 'Tamil',
    te: 'Telugu',
    kn: 'Kannada',
    ml: 'Malayalam'
  };
  // Handle cases like 'en-US' by taking the first part
  const baseCode = code.split('-')[0];
  return langMap[baseCode] || 'English';
};

export const agentsApi = {
  creditworthiness: (userDetails: Record<string, any>, message = '') =>
    api.post('/agents/creditworthiness', { user_details: userDetails, message, language: getAppLanguage() }),

  loan: (userDetails: Record<string, any>, message = '') =>
    api.post('/agents/loan', { user_details: userDetails, message, language: getAppLanguage() }),

  scheme: (userDetails: Record<string, any>, message = '') =>
    api.post('/agents/scheme', { user_details: userDetails, message, language: getAppLanguage() }),

  insurance: (userDetails: Record<string, any>, message = '') =>
    api.post('/agents/insurance', { user_details: userDetails, message, language: getAppLanguage() }),

  savings: (userDetails: Record<string, any>, message = '') =>
    api.post('/agents/savings', { user_details: userDetails, message, language: getAppLanguage() }),

  notification: (userDetails: Record<string, any>, message = '') =>
    api.post('/agents/notification', { user_details: userDetails, message, language: getAppLanguage() }),

  literacy: (userDetails: Record<string, any>, message = '') =>
    api.post('/agents/literacy', { user_details: userDetails, message, language: getAppLanguage() }),
};

