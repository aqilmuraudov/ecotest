/**
 * Site-wide contact & social data — SINGLE SOURCE OF TRUTH.
 *
 * Why this file exists:
 * The phone number, email, and social links used to be hardcoded
 * separately inside Footer.tsx, ContactModal.tsx and ContactPage.tsx.
 * Any redesign pass (e.g. from Google AI Studio / Gemini) that touched
 * only one of those files could silently leave the others out of sync,
 * or re-introduce stale values if a file was regenerated from an older
 * version.
 *
 * Fix: every component now imports SITE_CONFIG from here instead of
 * typing the phone/email/social values inline. Update a value once,
 * here, and it is correct everywhere — including in any future
 * redesigned file, as long as it imports SITE_CONFIG instead of
 * hardcoding the value again.
 */

export const SITE_CONFIG = {
  phone: {
    display: '+994 50 450 70 07',
    href: 'tel:+994504507007',
  },
  email: {
    display: 'info@ecolife.az',
    href: 'mailto:info@ecolife.az',
  },
  social: {
    instagram: 'https://instagram.com/ecolife.home',
    facebook: 'https://facebook.com',
    linkedin: 'https://linkedin.com',
  },
} as const;
