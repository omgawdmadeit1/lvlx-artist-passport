import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;

    if (!secretKey) {
      return NextResponse.json(
        { error: 'Stripe is not configured yet' },
        { status: 500 }
      );
    }

    const stripe = new Stripe(secretKey);

    const { plan = 'pro' } = await request.json();

    const priceMap: Record<string, number> = {
      pro: 1900,
      team: 4900,
    };

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: plan === 'team' ? 'Team Plan' : 'Pro Plan',
            },
            unit_amount: priceMap[plan] || 1900,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://lvlx-artist-passport.vercel.app'}/dashboard/agents?paid=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://lvlx-artist-passport.vercel.app'}/agents?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return NextResponse.json({ error: 'Checkout failed' }, { status: 500 });
  }
}