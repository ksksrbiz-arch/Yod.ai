// infra/stripe/products.ts
//
// Source-of-truth definitions for Stripe products and prices. Sync via:
//   tsx infra/stripe/sync.ts   (todo)

export interface StripeProductSpec {
  id: string;
  name: string;
  description: string;
  prices: Array<{
    id: string;
    nickname: string;
    unit_amount: number; // in cents
    currency: 'usd';
    recurring: { interval: 'month' | 'year' };
  }>;
}

export const PRODUCTS: StripeProductSpec[] = [
  {
    id: 'padawan',
    name: 'Padawan',
    description: 'Unlimited questions, voice communion, full memory.',
    prices: [
      {
        id: 'padawan_monthly',
        nickname: 'Padawan · monthly',
        unit_amount: 497,
        currency: 'usd',
        recurring: { interval: 'month' },
      },
    ],
  },
  {
    id: 'master',
    name: 'Master',
    description: 'Everything in Padawan plus API access, white-label, custom training.',
    prices: [
      {
        id: 'master_monthly',
        nickname: 'Master · monthly',
        unit_amount: 1997,
        currency: 'usd',
        recurring: { interval: 'month' },
      },
    ],
  },
];
