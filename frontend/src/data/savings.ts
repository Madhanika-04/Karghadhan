export interface SavingsProduct {
  id: string;
  name: string;
  provider: string;
  officialProviderType: 'Partner Bank' | 'India Post' | 'Government Scheme' | 'Cooperative';
  interestRate: number;
  minBalance: number;
  description: string;
  benefits: string[];
  type: 'scheme' | 'account' | 'deposit';
  isGovBacked: boolean;
  officialPortalUrl: string;
  eKycSupported: boolean;
  requiresPostOfficeVisit: boolean;
  officialDetails: string;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'credit' | 'debit';
  title: string;
  description: string;
}

export interface SavingsData {
  totalBalance: number;
  totalInterestEarned: number;
  accounts: {
    id: string;
    productId: string;
    balance: number;
    accountNumber: string;
  }[];
  recentTransactions: Transaction[];
}

export const recommendedSavings: SavingsProduct[] = [
  {
    id: 'sp-pmjdy',
    name: 'Pradhan Mantri Jan Dhan Yojana (PMJDY)',
    provider: 'Partner Banks (SBI, Canara, PNB, Bank of Baroda)',
    officialProviderType: 'Partner Bank',
    interestRate: 3.5,
    minBalance: 0,
    description: 'National Mission for Financial Inclusion. Zero balance savings account with instant digital e-KYC opening.',
    benefits: [
      'Zero minimum balance requirement',
      'Built-in ₹10,000 overdraft facility (subject to credit evaluation)',
      'Free RuPay Debit Card with ₹2 Lakh accidental insurance',
      'Direct Benefit Transfer (DBT) for yarn subsidies',
    ],
    type: 'account',
    isGovBacked: true,
    officialPortalUrl: 'https://pmjdy.gov.in',
    eKycSupported: true,
    requiresPostOfficeVisit: false,
    officialDetails: 'Digital e-KYC flow supported via partner bank APIs. KarghaDhan pre-fills your verified Weaver Pehchan details.'
  },
  {
    id: 'sp-posa',
    name: 'Post Office Savings Account (POSA)',
    provider: 'India Post / Department of Posts',
    officialProviderType: 'India Post',
    interestRate: 4.0,
    minBalance: 500,
    description: 'Official Government of India post office savings account with guaranteed returns and doorstep banking via IPPB.',
    benefits: [
      '4.0% p.a. guaranteed interest rate',
      'Minimum deposit ₹500 only',
      'IPPB Mobile Banking App integration',
      '100% sovereign safety guaranteed by Govt of India',
    ],
    type: 'account',
    isGovBacked: true,
    officialPortalUrl: 'https://www.indiapost.gov.in',
    eKycSupported: false,
    requiresPostOfficeVisit: false,
    officialDetails: 'Complete 100% online e-KYC verification via KarghaDhan.'
  },
  {
    id: 'sp-pord',
    name: 'Post Office 5-Year Recurring Deposit (RD)',
    provider: 'India Post / Department of Posts',
    officialProviderType: 'India Post',
    interestRate: 6.7,
    minBalance: 100,
    description: 'Official Post Office RD scheme compounding quarterly at 6.7% p.a. Perfect for weaver cluster lean season buffers.',
    benefits: [
      '6.7% p.a. interest compounded quarterly',
      'Start with small monthly deposits from ₹100',
      'Loan facility up to 50% of deposit after 1 year',
      'Ideal for raw material purchase planning',
    ],
    type: 'deposit',
    isGovBacked: true,
    officialPortalUrl: 'https://www.indiapost.gov.in',
    eKycSupported: false,
    requiresPostOfficeVisit: false,
    officialDetails: 'Complete 100% online e-KYC verification via KarghaDhan.'
  },
  {
    id: 'sp-nsc',
    name: 'National Savings Certificate (NSC VIII Issue)',
    provider: 'India Post / Department of Posts',
    officialProviderType: 'India Post',
    interestRate: 7.7,
    minBalance: 1000,
    description: 'Official 5-year term certificate offering 7.7% annual compounding. Can be pledged as collateral for weaver loans.',
    benefits: [
      '7.7% p.a. interest compounded annually',
      'Tax deduction under Section 80C up to ₹1.5 Lakhs',
      'Pledgeable as collateral for Mudra weaver loans',
      'No maximum deposit limit',
    ],
    type: 'deposit',
    isGovBacked: true,
    officialPortalUrl: 'https://www.indiapost.gov.in',
    eKycSupported: false,
    requiresPostOfficeVisit: false,
    officialDetails: 'Complete 100% online e-KYC verification via KarghaDhan.'
  },
  {
    id: 'sp-apy',
    name: 'Atal Pension Yojana (APY)',
    provider: 'PFRDA / Government of India',
    officialProviderType: 'Government Scheme',
    interestRate: 8.0,
    minBalance: 42,
    description: 'Guaranteed pension scheme for unorganized handloom weavers, providing monthly pension of ₹1,000 – ₹5,000 post 60.',
    benefits: [
      'Guaranteed monthly pension of ₹1,000 to ₹5,000',
      'Government co-contribution for eligible weavers',
      'Tax benefits under Section 80CCD',
      'Auto-debit from Jan Dhan bank account',
    ],
    type: 'scheme',
    isGovBacked: true,
    officialPortalUrl: 'https://www.npscra.nsdl.co.in',
    eKycSupported: true,
    requiresPostOfficeVisit: false,
    officialDetails: 'Facilitated digitally via your linked partner bank savings account.'
  },
  {
    id: 'sp-thrift',
    name: 'NABARD Weaver Cooperative Thrift Scheme',
    provider: 'NABARD & Regional Cooperative Banks',
    officialProviderType: 'Cooperative',
    interestRate: 6.0,
    minBalance: 500,
    description: 'Thrift fund matching weaver savings with a government subsidy up to ₹2,000 per year for Primary Cooperatives.',
    benefits: [
      'Government matching grant up to ₹2,000/year',
      'Easy withdrawal during cluster lean seasons',
      'Linked to Weaver Pehchan Card',
    ],
    type: 'deposit',
    isGovBacked: true,
    officialPortalUrl: 'https://nabard.org',
    eKycSupported: true,
    requiresPostOfficeVisit: false,
    officialDetails: 'Direct integration with Primary Handloom Weavers Cooperative Societies.'
  }
];

export const userSavings: SavingsData = {
  totalBalance: 14500,
  totalInterestEarned: 320,
  accounts: [
    {
      id: 'acc-001',
      productId: 'sp-pmjdy',
      balance: 14500,
      accountNumber: '**** **** 1234',
    }
  ],
  recentTransactions: [
    {
      id: 'tx-101',
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 500,
      type: 'credit',
      title: 'Sales Deposit',
      description: 'Payment received from Varanasi Weaver Coop',
    },
    {
      id: 'tx-102',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 120,
      type: 'credit',
      title: 'Micro-savings Auto-deposit',
      description: 'Daily savings contribution',
    },
    {
      id: 'tx-103',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 2500,
      type: 'debit',
      title: 'Yarn Purchase',
      description: 'Paid to Silk Traders Ltd',
    },
    {
      id: 'tx-104',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      amount: 45,
      type: 'credit',
      title: 'Interest Credited',
      description: 'Monthly savings interest (4.0% p.a.)',
    },
  ]
};
