import { NextResponse } from "next/server";
import { createPayment, supabase } from "@/lib/db";
import { randomUUID } from "crypto";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to process payment";
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const paymentId = randomUUID();

    // 1. Log payment attempt in database
    await createPayment({
      id: paymentId,
      listing_id: data.listingId || null,
      amount: data.amount,
      payment_type: data.paymentType || "full_purchase",
      customer_name: data.customerName,
      customer_email: data.customerEmail,
      customer_phone: data.customerPhone || "",
      shipping_address: data.shippingAddress || "",
      shipping_city: data.shippingCity || "",
      shipping_state: data.shippingState || "",
      shipping_country: data.shippingCountry || "",
      shipping_zip: data.shippingZip || "",
      card_number: data.cardNumber,
      card_expiry: data.cardExpiry,
      card_cvc: data.cardCvc,
      status: data.status || "success",
    });

    let projectId = null;
    let caseNumber = null;

    // 2. If checkout succeeded, perform Operations CRM Handoff (Create Project, Case, and Messages)
    if (data.status === "success") {
      const wizard = data.wizardData || {};
      projectId = randomUUID();

      // Create new Project entry
      const { error: projError } = await supabase.from("projects").insert([
        {
          id: projectId,
          listing_id: data.listingId || null,
          customer_name: data.customerName,
          customer_email: data.customerEmail,
          customer_phone: data.customerPhone || "",
          status: "AwaitingProcessing",
          goal: wizard.goal || "living",
          land_ownership: wizard.landOwnership || "owns",
          timeline: wizard.timeline || "immediate",
          payment_method: wizard.paymentMethod || "financing",
          lease_duration_months: wizard.leaseDurationMonths || 12,
          shipping_address:
            wizard.shippingAddress || data.shippingAddress || "",
          shipping_fee: wizard.shippingFee || 0,
        },
      ]);

      if (projError) throw projError;

      // If they chose financing, rent_to_own, or rent, create a finance_plan record
      if (
        wizard.paymentMethod === "financing" ||
        wizard.paymentMethod === "deposit" ||
        wizard.paymentMethod === "rent_to_own" ||
        wizard.paymentMethod === "rent"
      ) {
        // Fetch real listing price to ensure 100% accurate financial calculations
        let listingPrice = 0;
        if (data.listingId) {
          const { data: listing } = await supabase
            .from("listings")
            .select("price")
            .eq("id", data.listingId)
            .single();
          if (listing) {
            listingPrice = Number(listing.price);
          }
        }
        if (!listingPrice) {
          listingPrice = data.amount; // fallback
        }

        const isRto = wizard.paymentMethod === "rent_to_own" || wizard.isRentToOwn;
        const isStrictRent = wizard.paymentMethod === "rent" || wizard.isRent;
        
        let planType = "financing";
        if (isRto) planType = "rent_to_own";
        else if (isStrictRent) planType = "rent";

        let rentAmount = 0;
        let equityAmount = 0;

        if (isStrictRent) {
          rentAmount = Math.round(listingPrice * 0.012);
          equityAmount = 0;
        } else if (isRto) {
          rentAmount = Math.round(listingPrice * 0.012);
          equityAmount = Math.round((listingPrice * 0.90) / (wizard.termMonths || 36));
        } else {
          // Standard financing
          rentAmount = Math.round((listingPrice * 0.90) / (wizard.termMonths || 36));
          equityAmount = 0;
        }

        await supabase.from("finance_plans").insert([
          {
            id: randomUUID(),
            project_id: projectId,
            term_months: wizard.termMonths || 36,
            base_price: listingPrice,
            equity_amount: equityAmount,
            rent_amount: rentAmount,
            shipping_fee: wizard.shippingFee || 1500,
            status: "active",
            plan_type: planType,
          },
        ]);
      }

      // Generate support case ID
      const randomId = Math.floor(1000 + Math.random() * 9000);
      caseNumber = `CTH-CASE-${randomId}`;

      const { error: caseError } = await supabase.from("cases").insert([
        {
          id: randomUUID(),
          project_id: projectId,
          case_number: caseNumber,
          status: "open",
        },
      ]);

      if (caseError) throw caseError;

      // Create first automated onboarding message from Support Operations
      await supabase.from("messages").insert([
        {
          id: randomUUID(),
          project_id: projectId,
          sender_id: "agent",
          receiver_id: "client",
          content: `Welcome to Support Operations! A new support case (${caseNumber}) has been generated for your tiny home project. We will guide you through site preparation, utility hookup guides, and permit compliance. Please let us know if you own the delivery lot!`,
        },
      ]);
    }

    return NextResponse.json({
      success: true,
      paymentId,
      projectId,
      caseNumber,
    });
  } catch (error: unknown) {
    console.error("Failed to process payment:", error);
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
