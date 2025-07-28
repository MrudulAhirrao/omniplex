// src/app/api/stripe/route.ts

import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

// Initialize Stripe with your secret key
const stripe = new Stripe(process.env.Secret_key!);

export async function POST(req: NextRequest) {
  try {
    // --- IMPORTANT ---
    // Get this Price ID from your Stripe Dashboard after creating the "Pro Plan" product.
    const priceId = "price_1RpZatCjBDu9B6yv0H95mAtd"; // Replace with your actual Price ID

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      // These are the URLs Stripe will redirect to after payment
      success_url: `${req.nextUrl.origin}/payment/success`,
      cancel_url: `${req.nextUrl.origin}/payment/cancel`,
    });

    // Return the session URL for the frontend to redirect to
    return NextResponse.json({ url: session.url });

  } catch (error) {
    console.error("Stripe Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}