"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userSavings = exports.recommendedSavings = void 0;
exports.recommendedSavings = [
    {
        id: 'sp-001',
        name: 'Weaver Micro-Savings Account',
        provider: 'Karghadhan Partner Bank',
        interestRate: 6.5,
        minBalance: 100,
        description: 'A zero-fee savings account tailored for handloom weavers with daily auto-deposit options.',
        benefits: [
            'Zero maintenance fees',
            'Daily micro-deposits from ₹10',
            'Free life insurance cover of ₹1 Lakh',
            'Instant access via UPI',
        ],
        type: 'account',
        isGovBacked: false,
    },
    {
        id: 'sp-002',
        name: 'Atal Pension Yojana (APY)',
        provider: 'Government of India',
        interestRate: 8.0,
        minBalance: 42,
        description: 'A guaranteed pension scheme for unorganized sector workers, providing monthly pension after 60.',
        benefits: [
            'Guaranteed pension of ₹1000 - ₹5000/month',
            'Government co-contribution for eligible weavers',
            'Tax benefits under 80CCD',
        ],
        type: 'scheme',
        isGovBacked: true,
    },
    {
        id: 'sp-003',
        name: 'Raw Material Recurring Deposit',
        provider: 'Karghadhan Finance',
        interestRate: 7.2,
        minBalance: 500,
        description: 'Save monthly to buy bulk yarn and silk during peak seasons with special bonus interest.',
        benefits: [
            'High interest on short-term deposits (6-12 months)',
            '1% bonus interest if used for purchasing from partnered cooperatives',
            'Flexible monthly installments',
        ],
        type: 'deposit',
        isGovBacked: false,
    },
];
exports.userSavings = {
    totalBalance: 14500,
    totalInterestEarned: 320,
    accounts: [
        {
            id: 'acc-001',
            productId: 'sp-001',
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
            description: 'Payment received from Kanchipuram Coop',
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
            description: 'Monthly savings interest',
        },
    ]
};
