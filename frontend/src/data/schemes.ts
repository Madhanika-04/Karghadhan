import type { GovtScheme } from '../types';

export const govtSchemes: GovtScheme[] = [
  {
    id: 'raw-material-supply',
    name: 'Raw Material Supply Scheme',
    description:
      'Government scheme enabling weavers to procure high-quality raw materials like yarn, dyes, and chemicals at subsidised prices through co-operative societies.',
    benefits: [
      'Quality yarn at 30–50% subsidised rates',
      'Organised supply chain from mills to weavers',
      'Reduction in production cost',
      'Assured material availability throughout year',
    ],
    eligibility: [
      'Registered handloom weaver with Weaver ID',
      'Member of a registered handloom co-operative',
      'Not availing similar scheme from another department',
    ],
    documents: [
      'Weaver Registration Certificate',
      'Co-operative membership proof',
      'Aadhaar Card',
      'Bank passbook',
    ],
    deadline: '2025-03-31',
    category: 'Subsidies',
    ministry: 'Ministry of Textiles',
    isActive: true,
  },
  {
    id: 'yarn-subsidy',
    name: 'Yarn Subsidy Scheme',
    description:
      'Direct cash subsidy to handloom weavers for purchase of cotton, silk, and wool yarn, reducing input cost and supporting traditional textile production.',
    benefits: [
      'Direct benefit transfer of ₹4,000–₹12,000 per annum',
      'Covers cotton, silk, and wool yarn',
      'Applicable for both power loom and handloom',
      'No upper limit on quantity for small weavers',
    ],
    eligibility: [
      'Valid Weaver ID card issued by state government',
      'Annual income below ₹1.5 lakh',
      'Not employed in regular government service',
    ],
    documents: ['Weaver ID', 'Aadhaar Card', 'Income Certificate', 'Bank Account Details'],
    deadline: '2025-06-30',
    category: 'Subsidies',
    ministry: 'Ministry of Textiles',
    isActive: true,
  },
  {
    id: 'solar-loom',
    name: 'Solar Loom Scheme',
    description:
      'Provides solar-powered loom systems to weavers to reduce electricity dependency, support sustainable production, and reduce operational costs by up to 60%.',
    benefits: [
      '90% subsidy on solar loom installation',
      'Electricity cost reduction by 60%',
      'Green certification for products',
      'Priority in government purchase orders',
    ],
    eligibility: [
      'Registered weaver with minimum 3 years experience',
      'Own or leased weaving space',
      'Not previously received solar equipment grant',
    ],
    documents: [
      'Weaver Registration Certificate',
      'Proof of weaving space ownership/lease',
      'Aadhaar Card',
      'Passport photograph',
    ],
    deadline: '2025-09-30',
    category: 'Subsidies',
    ministry: 'Ministry of New and Renewable Energy',
    isActive: true,
  },
  {
    id: 'nhdp',
    name: 'National Handloom Development Programme',
    description:
      'Flagship government programme for comprehensive development of handloom sector including infrastructure, skill training, design development, and market access.',
    benefits: [
      'Infrastructure support for weaving clusters',
      'Design development and training stipend',
      'Market exposure at national and international fairs',
      'Brand building and product certification',
    ],
    eligibility: [
      'Individual weaver or weaver group',
      'Located in designated handloom cluster',
      'Valid registration with district handloom office',
    ],
    documents: [
      'Registration certificate from District Handloom Office',
      'Cluster ID proof',
      'Aadhaar Card',
      'Bank details',
    ],
    deadline: undefined,
    category: 'Training',
    ministry: 'Ministry of Textiles',
    isActive: true,
  },
  {
    id: 'skill-development',
    name: 'Skill Development Scheme for Handloom Weavers',
    description:
      `Training programme under Weavers' Service Centres to upgrade weaving skills, introduce new designs, modern techniques, and quality standards for domestic and export markets.`,
    benefits: [
      'Free 3–6 month training programme',
      'Monthly stipend of ₹3,000 during training',
      'Design portfolio creation',
      'Government-certified skill certificate',
      'Job placement assistance',
    ],
    eligibility: [
      'Age 18–45 years',
      'Registered weaver or family member of weaver',
      'Minimum 5th class education preferred',
    ],
    documents: [
      'Aadhaar Card',
      'Weaver ID or family weaver certificate',
      'Educational qualification proof',
      'Passport photograph',
    ],
    deadline: '2025-12-31',
    category: 'Training',
    ministry: 'Ministry of Textiles / NSDC',
    isActive: true,
  },
];
