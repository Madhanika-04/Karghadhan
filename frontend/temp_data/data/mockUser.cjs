"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifications = exports.suggestedQuestions = exports.aiResponses = exports.mockUser = void 0;
exports.mockUser = {
    id: 'WVR-2024-TN-4821',
    name: 'Hari Krishnan',
    age: 34,
    gender: 'Male',
    phone: '+91 98765 43210',
    district: 'Kanchipuram',
    state: 'Tamil Nadu',
    occupation: 'Silk Handloom Weaver',
    yearsOfExperience: 12,
    monthlyIncome: 18000,
    bankAccount: 'SBI ****4821',
    weaverIdNumber: 'TN-KCP-2018-W-04821',
    aadhaarNumber: 'XXXX XXXX 4821',
    profileCompletion: 95,
    isVerified: true,
    joinedDate: '2024-11-15',
    familyMembers: 4,
    ownsLoom: true,
    hasExistingLoan: false,
    hasExistingInsurance: false,
    hasUPI: true,
    savingsHabit: 'Monthly',
    trustScore: 780,
};
exports.aiResponses = {
    'which loan is best': `Based on your profile as a verified Silk Handloom Weaver in Kanchipuram with 12 years of experience, I recommend the **Handloom Weavers Loan Scheme** from NHDC. It offers a subsidised 6% interest rate specifically for weavers like you. You're also eligible for the **Mudra Loan (Shishu)** for immediate working capital needs with no collateral required.`,
    'which insurance should i buy': `For your situation, I strongly recommend enrolling in both:
1. **PMJJBY** – Only ₹436/year for ₹2 lakh life cover. Essential for your family's protection.
2. **PMSBY** – Only ₹20/year for ₹2 lakh accident cover. Very important for weavers who operate machinery.
3. **Ayushman Bharat** – FREE ₹5 lakh health coverage. Check your eligibility at the nearest PHC.`,
    'what is pmjjby': `**PMJJBY** (Pradhan Mantri Jeevan Jyoti Bima Yojana) is a government life insurance scheme.
- **Premium**: Only ₹436 per year (auto-deducted from your bank)
- **Cover**: ₹2 lakh paid to your family in case of your death (any reason)
- **Age**: 18–50 years
- **How to apply**: Walk into your bank branch and fill the PMJJBY consent form
- It's the most affordable life insurance available in India!`,
    'how to improve loan eligibility': `Here are 5 key steps to improve your loan eligibility:
1. **Build CIBIL score** – Pay all EMIs and credit card bills on time
2. **Maintain savings** – Keep 3–6 months income as bank balance
3. **Complete your profile** – Your current Karghadhan profile is 95% complete!
4. **Join a Cooperative** – Cooperative membership improves loan terms significantly
5. **Keep documents ready** – Aadhaar, Weaver ID, bank statements up to date`,
    'how to claim insurance': `Insurance claim process for PMJJBY:
1. Nominee informs the bank branch within **30 days** of policyholder's death
2. Submit: Death certificate, Claim form, Nominee ID proof
3. Bank forwards to insurer within 30 days
4. Amount of ₹2 lakh credited to nominee's account within **60 days**

For PMSBY accident claims:
1. Inform bank within **30 days** of accident
2. Submit: FIR copy, Medical certificate, Discharge summary
3. Claim settled within 60 days`,
    'default': `I'm Kargha AI! I can help you with:
- Finding the best **loans** for your weaving business
- Choosing the right **insurance** policies
- Discovering **government schemes** you're eligible for
- Understanding **financial concepts** in simple language

Ask me anything! I'm here to help you make the best financial decisions.`,
};
exports.suggestedQuestions = [
    { id: 'q1', text: 'Which loan is best for me?', category: 'Loans' },
    { id: 'q2', text: 'Which insurance should I buy?', category: 'Insurance' },
    { id: 'q3', text: 'What is PMJJBY?', category: 'Insurance' },
    { id: 'q4', text: 'How to improve loan eligibility?', category: 'Loans' },
    { id: 'q5', text: 'How to claim insurance?', category: 'Insurance' },
];
exports.notifications = [
    {
        id: 'n1',
        title: 'Loan Application Pending',
        message: 'Your Mudra Loan application is under review. Expected response: 3–5 days.',
        type: 'info',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        isRead: false,
    },
    {
        id: 'n2',
        title: 'New Scheme Available',
        message: 'Solar Loom Scheme applications open until Sep 2025. You are eligible!',
        type: 'success',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isRead: false,
    },
    {
        id: 'n3',
        title: 'Insurance Renewal Due',
        message: 'PMJJBY renewal due in 15 days. Premium: ₹436.',
        type: 'warning',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000),
        isRead: true,
    },
];
