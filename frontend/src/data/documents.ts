import type { UserDocument } from '../types';

export const documents: UserDocument[] = [
  {
    id: 'doc-1',
    name: 'Aadhaar Card',
    type: 'Identity Proof',
    uploadDate: '2024-11-15',
    status: 'Verified',
    fileUrl: '/mock/aadhaar.pdf',
    icon: '🪪',
  },
  {
    id: 'doc-2',
    name: 'Weaver ID',
    type: 'Professional ID',
    uploadDate: '2024-11-15',
    status: 'Verified',
    fileUrl: '/mock/weaver_id.pdf',
    icon: '🧵',
  },
  {
    id: 'doc-3',
    name: 'PAN Card',
    type: 'Identity Proof',
    uploadDate: '2024-12-01',
    status: 'Pending',
    fileUrl: '/mock/pan.pdf',
    icon: '💳',
  },
  {
    id: 'doc-4',
    name: 'Bank Passbook',
    type: 'Financial Proof',
    uploadDate: '2024-12-05',
    status: 'Verified',
    fileUrl: '/mock/passbook.pdf',
    icon: '🏦',
  },
];
