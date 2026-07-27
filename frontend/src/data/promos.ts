import type { PromoBanner } from '../components/ui/PromoCarousel';

export const globalPromos: PromoBanner[] = [
  {
    id: 'promo-1',
    imageSrc: '/assets/banners/banner_grow.png',
    title: 'Grow Your Weaving Business',
    description: 'Get access to fast, collateral-free micro-credit to expand your inventory and buy new yarn.',
    ctaText: 'Apply Now',
    onCtaClick: () => { window.location.href = '/loans'; },
    accentColor: 'from-primary-900/90 via-primary-900/60 to-transparent'
  },
  {
    id: 'promo-2',
    imageSrc: '/assets/banners/banner_protect.png',
    title: 'Protect Your Family',
    description: 'Ensure your loved ones are secure with our affordable micro-insurance plans starting at ₹12/year.',
    ctaText: 'View Plans',
    onCtaClick: () => { window.location.href = '/insurance'; },
    accentColor: 'from-orange-900/90 via-orange-900/60 to-transparent'
  },
  {
    id: 'promo-3',
    imageSrc: '/assets/banners/banner_upgrade.png',
    title: 'Upgrade Your Loom',
    description: 'Avail up to 35% subsidy on modern jacquard looms under the PMEGP scheme.',
    ctaText: 'Check Eligibility',
    onCtaClick: () => { window.location.href = '/schemes'; },
    accentColor: 'from-indigo-900/90 via-indigo-900/60 to-transparent'
  }
];
