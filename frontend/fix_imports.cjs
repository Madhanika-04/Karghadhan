const fs = require('fs');

function prepend(filePath, text) {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf-8');
    if (!content.includes(text.split('\n')[0].trim())) {
        fs.writeFileSync(filePath, text + '\n' + content, 'utf-8');
        console.log(`Fixed ${filePath}`);
    }
}

prepend('src/components/hero/AssistantHero.tsx', "import logoKargha from '@/assets/logos/logoKargha.png';");
prepend('src/components/hero/InsuranceHero.tsx', "import bannerProtect from '@/assets/banners/banner_protect.png';");
prepend('src/components/hero/LiteracyHero.tsx', "import educationLoan from '@/assets/loans/education_loan.png';");
prepend('src/components/hero/LoansHero.tsx', "import businessExpansion from '@/assets/loans/business_expansion.png';");
prepend('src/components/hero/PaymentsHero.tsx', "import microCredit from '@/assets/loans/micro_credit.png';");
prepend('src/components/hero/SavingsHero.tsx', "import workingCapital from '@/assets/loans/working_capital.png';");
prepend('src/components/hero/SchemesHero.tsx', "import bannerUpgrade from '@/assets/banners/banner_upgrade.png';");

prepend('src/data/loans.ts', `import mudraLoan from '@/assets/loans/mudra_loan.png';
import weaverLoan from '@/assets/loans/weaver_loan.png';
import pmegpLoan from '@/assets/loans/pmegp_loan.png';
import womenWeaver from '@/assets/loans/women_weaver.png';
import businessExpansion from '@/assets/loans/business_expansion.png';
import workingCapital from '@/assets/loans/working_capital.png';`);

prepend('src/data/promos.ts', `import bannerGrow from '@/assets/banners/banner_grow.png';
import bannerProtect from '@/assets/banners/banner_protect.png';
import bannerUpgrade from '@/assets/banners/banner_upgrade.png';`);

prepend('src/data/schemes.ts', `import businessLoanHero from '@/assets/illustrations/business_loan_hero.png';
import microCreditHero from '@/assets/illustrations/micro_credit_hero.png';
import assetInsuranceHero from '@/assets/illustrations/asset_insurance_hero.png';
import womenWeaverHero from '@/assets/illustrations/women_weaver_hero.png';
import workingCapitalHero from '@/assets/illustrations/working_capital_hero.png';`);

prepend('src/data/insurance.ts', `import lifeInsuranceHero from '@/assets/illustrations/life_insurance_hero.png';
import accidentInsuranceHero from '@/assets/illustrations/accident_insurance_hero.png';
import healthInsuranceHero from '@/assets/illustrations/health_insurance_hero.png';
import assetInsuranceHero from '@/assets/illustrations/asset_insurance_hero.png';`);

// Fix DashboardPage.tsx ts issue with imageSrc
const dashboardPath = 'src/pages/DashboardPage.tsx';
if (fs.existsSync(dashboardPath)) {
    let content = fs.readFileSync(dashboardPath, 'utf-8');
    content = content.replace(/imageSrc=\{(loan\.imageSrc \|\| businessLoanHero)\}/g, "imageSrc={$1 as string}");
    content = content.replace(/imageSrc=\{(policy\.imageSrc \|\| lifeInsuranceHero)\}/g, "imageSrc={$1 as string}");
    fs.writeFileSync(dashboardPath, content, 'utf-8');
}
