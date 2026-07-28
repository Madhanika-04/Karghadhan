const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, replacements) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let original = content;
    for (let r of replacements) {
        content = content.replace(r.search, r.replace);
    }
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf-8');
        console.log(`Updated ${filePath}`);
    }
}

// 1. Data files
const schemesPath = path.join(__dirname, 'src', 'data', 'schemes.ts');
replaceInFile(schemesPath, [
    { search: /imageSrc: '\/illustrations\/business_loan_hero\.png'/g, replace: 'imageSrc: businessLoanHero' },
    { search: /imageSrc: '\/illustrations\/micro_credit_hero\.png'/g, replace: 'imageSrc: microCreditHero' },
    { search: /imageSrc: '\/illustrations\/asset_insurance_hero\.png'/g, replace: 'imageSrc: assetInsuranceHero' },
    { search: /imageSrc: '\/illustrations\/women_weaver_hero\.png'/g, replace: 'imageSrc: womenWeaverHero' },
    { search: /imageSrc: '\/illustrations\/working_capital_hero\.png'/g, replace: 'imageSrc: workingCapitalHero' },
    { search: /export const schemes/g, replace: `import businessLoanHero from '@/assets/illustrations/business_loan_hero.png';\nimport microCreditHero from '@/assets/illustrations/micro_credit_hero.png';\nimport assetInsuranceHero from '@/assets/illustrations/asset_insurance_hero.png';\nimport womenWeaverHero from '@/assets/illustrations/women_weaver_hero.png';\nimport workingCapitalHero from '@/assets/illustrations/working_capital_hero.png';\n\nexport const schemes` }
]);

const insurancePath = path.join(__dirname, 'src', 'data', 'insurance.ts');
replaceInFile(insurancePath, [
    { search: /imageSrc: '\/illustrations\/life_insurance_hero\.png'/g, replace: 'imageSrc: lifeInsuranceHero' },
    { search: /imageSrc: '\/illustrations\/accident_insurance_hero\.png'/g, replace: 'imageSrc: accidentInsuranceHero' },
    { search: /imageSrc: '\/illustrations\/health_insurance_hero\.png'/g, replace: 'imageSrc: healthInsuranceHero' },
    { search: /imageSrc: '\/illustrations\/asset_insurance_hero\.png'/g, replace: 'imageSrc: assetInsuranceHero' },
    { search: /export const insurancePolicies/g, replace: `import lifeInsuranceHero from '@/assets/illustrations/life_insurance_hero.png';\nimport accidentInsuranceHero from '@/assets/illustrations/accident_insurance_hero.png';\nimport healthInsuranceHero from '@/assets/illustrations/health_insurance_hero.png';\nimport assetInsuranceHero from '@/assets/illustrations/asset_insurance_hero.png';\n\nexport const insurancePolicies` }
]);

const promosPath = path.join(__dirname, 'src', 'data', 'promos.ts');
replaceInFile(promosPath, [
    { search: /imageSrc: '\/assets\/banners\/banner_grow\.png'/g, replace: 'imageSrc: bannerGrow' },
    { search: /imageSrc: '\/assets\/banners\/banner_protect\.png'/g, replace: 'imageSrc: bannerProtect' },
    { search: /imageSrc: '\/assets\/banners\/banner_upgrade\.png'/g, replace: 'imageSrc: bannerUpgrade' },
    { search: /export const promos/g, replace: `import bannerGrow from '@/assets/banners/banner_grow.png';\nimport bannerProtect from '@/assets/banners/banner_protect.png';\nimport bannerUpgrade from '@/assets/banners/banner_upgrade.png';\n\nexport const promos` }
]);

const loansPath = path.join(__dirname, 'src', 'data', 'loans.ts');
replaceInFile(loansPath, [
    { search: /imageSrc: '\/assets\/loans\/mudra_loan\.png'/g, replace: 'imageSrc: mudraLoan' },
    { search: /imageSrc: '\/assets\/loans\/weaver_loan\.png'/g, replace: 'imageSrc: weaverLoan' },
    { search: /imageSrc: '\/assets\/loans\/pmegp_loan\.png'/g, replace: 'imageSrc: pmegpLoan' },
    { search: /imageSrc: '\/assets\/loans\/women_weaver\.png'/g, replace: 'imageSrc: womenWeaver' },
    { search: /imageSrc: '\/assets\/loans\/business_expansion\.png'/g, replace: 'imageSrc: businessExpansion' },
    { search: /imageSrc: '\/assets\/loans\/working_capital\.png'/g, replace: 'imageSrc: workingCapital' },
    { search: /export const loanProducts/g, replace: `import mudraLoan from '@/assets/loans/mudra_loan.png';\nimport weaverLoan from '@/assets/loans/weaver_loan.png';\nimport pmegpLoan from '@/assets/loans/pmegp_loan.png';\nimport womenWeaver from '@/assets/loans/women_weaver.png';\nimport businessExpansion from '@/assets/loans/business_expansion.png';\nimport workingCapital from '@/assets/loans/working_capital.png';\n\nexport const loanProducts` }
]);

// 2. Component/Pages string fallbacks
const dashboardPath = path.join(__dirname, 'src', 'pages', 'DashboardPage.tsx');
replaceInFile(dashboardPath, [
    { search: /imageSrc=\{loan\.imageSrc \|\| '\/illustrations\/business_loan_hero\.png'\}/g, replace: 'imageSrc={loan.imageSrc || businessLoanHero}' },
    { search: /imageSrc=\{policy\.imageSrc \|\| '\/illustrations\/life_insurance_hero\.png'\}/g, replace: 'imageSrc={policy.imageSrc || lifeInsuranceHero}' },
    { search: /import React/g, replace: `import React\nimport businessLoanHero from '@/assets/illustrations/business_loan_hero.png';\nimport lifeInsuranceHero from '@/assets/illustrations/life_insurance_hero.png';` }
]);

const schemesPagePath = path.join(__dirname, 'src', 'pages', 'SchemesPage.tsx');
replaceInFile(schemesPagePath, [
    { search: /imageSrc=\{scheme\.imageSrc \|\| '\/illustrations\/business_loan_hero\.png'\}/g, replace: 'imageSrc={scheme.imageSrc || businessLoanHero}' },
    { search: /import React/g, replace: `import React\nimport businessLoanHero from '@/assets/illustrations/business_loan_hero.png';` }
]);

const loansPagePath = path.join(__dirname, 'src', 'pages', 'LoansPage.tsx');
replaceInFile(loansPagePath, [
    { search: /imageSrc=\{loan\.imageSrc \|\| '\/illustrations\/business_loan_hero\.png'\}/g, replace: 'imageSrc={loan.imageSrc || businessLoanHero}' },
    { search: /import React/g, replace: `import React\nimport businessLoanHero from '@/assets/illustrations/business_loan_hero.png';` }
]);

const govSchemesTabPath = path.join(__dirname, 'src', 'components', 'insurance', 'GovernmentSchemesTab.tsx');
replaceInFile(govSchemesTabPath, [
    { search: /imageSrc=\{policy\.imageSrc \|\| '\/illustrations\/life_insurance_hero\.png'\}/g, replace: 'imageSrc={policy.imageSrc || lifeInsuranceHero}' },
    { search: /import React/g, replace: `import React\nimport lifeInsuranceHero from '@/assets/illustrations/life_insurance_hero.png';` }
]);

const insuranceProvidersTabPath = path.join(__dirname, 'src', 'components', 'insurance', 'InsuranceProvidersTab.tsx');
replaceInFile(insuranceProvidersTabPath, [
    { search: /src=\{provider\.logo\}/g, replace: 'src={provider.logo} // NOTE: Assumes logos are imported in data' }
]);

// 3. Hero Images
const schemesHeroPath = path.join(__dirname, 'src', 'components', 'hero', 'SchemesHero.tsx');
replaceInFile(schemesHeroPath, [
    { search: /src="\/assets\/banners\/banner_upgrade\.png"/g, replace: 'src={bannerUpgrade}' },
    { search: /import React/g, replace: `import React\nimport bannerUpgrade from '@/assets/banners/banner_upgrade.png';` }
]);

const savingsHeroPath = path.join(__dirname, 'src', 'components', 'hero', 'SavingsHero.tsx');
replaceInFile(savingsHeroPath, [
    { search: /src="\/assets\/loans\/working_capital\.png"/g, replace: 'src={workingCapital}' },
    { search: /import React/g, replace: `import React\nimport workingCapital from '@/assets/loans/working_capital.png';` }
]);

const paymentsHeroPath = path.join(__dirname, 'src', 'components', 'hero', 'PaymentsHero.tsx');
replaceInFile(paymentsHeroPath, [
    { search: /src="\/assets\/loans\/micro_credit\.png"/g, replace: 'src={microCredit}' },
    { search: /import React/g, replace: `import React\nimport microCredit from '@/assets/loans/micro_credit.png';` }
]);

const loansHeroPath = path.join(__dirname, 'src', 'components', 'hero', 'LoansHero.tsx');
replaceInFile(loansHeroPath, [
    { search: /src="\/assets\/loans\/business_expansion\.png"/g, replace: 'src={businessExpansion}' },
    { search: /import React/g, replace: `import React\nimport businessExpansion from '@/assets/loans/business_expansion.png';` }
]);

const insuranceHeroPath = path.join(__dirname, 'src', 'components', 'hero', 'InsuranceHero.tsx');
replaceInFile(insuranceHeroPath, [
    { search: /src="\/assets\/banners\/banner_protect\.png"/g, replace: 'src={bannerProtect}' },
    { search: /import React/g, replace: `import React\nimport bannerProtect from '@/assets/banners/banner_protect.png';` }
]);

const literacyHeroPath = path.join(__dirname, 'src', 'components', 'hero', 'LiteracyHero.tsx');
replaceInFile(literacyHeroPath, [
    { search: /src="\/assets\/loans\/education_loan\.png"/g, replace: 'src={educationLoan}' },
    { search: /import React/g, replace: `import React\nimport educationLoan from '@/assets/loans/education_loan.png';` }
]);

const assistantHeroPath = path.join(__dirname, 'src', 'components', 'hero', 'AssistantHero.tsx');
replaceInFile(assistantHeroPath, [
    { search: /src="\/assets\/logokargha\.png"/g, replace: 'src={logoKargha}' },
    { search: /import React/g, replace: `import React\nimport logoKargha from '@/assets/logos/logoKargha.png';` }
]);

// 4. External URL replacements
const loginPagePath = path.join(__dirname, 'src', 'pages', 'LoginPage.tsx');
replaceInFile(loginPagePath, [
    { search: /src="https:\/\/www\.svgrepo\.com\/show\/475656\/google-color\.svg"/g, replace: 'src={googleIcon}' },
    { search: /import React/g, replace: `import React\nimport googleIcon from '@/assets/icons/google-color.svg';` }
]);

const paymentsPagePath = path.join(__dirname, 'src', 'pages', 'PaymentsPage.tsx');
replaceInFile(paymentsPagePath, [
    { search: /image: 'https:\/\/i\.pravatar\.cc\/150\?u=1'/g, replace: 'image: user1' },
    { search: /image: 'https:\/\/i\.pravatar\.cc\/150\?u=2'/g, replace: 'image: user2' },
    { search: /image: 'https:\/\/i\.pravatar\.cc\/150\?u=3'/g, replace: 'image: user3' },
    { search: /image: 'https:\/\/i\.pravatar\.cc\/150\?u=4'/g, replace: 'image: user4' },
    { search: /import React/g, replace: `import React\nimport user1 from '@/assets/profile/user1.jpg';\nimport user2 from '@/assets/profile/user2.jpg';\nimport user3 from '@/assets/profile/user3.jpg';\nimport user4 from '@/assets/profile/user4.jpg';` }
]);

console.log("Refactoring script completed.");
