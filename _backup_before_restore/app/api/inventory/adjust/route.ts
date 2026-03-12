import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const {
      inventoryId,
      mode, // "set" | "increment" | "decrement"
      amount, // number
    } = body;

    if (!inventoryId || !mode || typeof amount !== "number") {
      return NextResponse.json(
        { error: "Missing or invalid parameters" },
        { status: 400 }
      );
    }

    // Fetch current row (we need current quantity + batch_id)
    const { data: currentRow, error: fetchError } = await supabase
      .from("inventory")
      .select("id, quantity, batch_id")
      .eq("id", inventoryId)
      .single();

    if (fetchError || !currentRow) {
      return NextResponse.json(
        { error: fetchError?.message ?? "Inventory item not found" },
        { status: 404 }
      );
    }

    let newQuantity = currentRow.quantity ?? 0;

    if (mode === "set") {
      newQuantity = amount;
    } else if (mode === "increment") {
      newQuantity = newQuantity + amount;
    } else if (mode === "decrement") {
      newQuantity = newQuantity - amount;
      if (newQuantity < 0) newQuantity = 0;
    } else {
      return NextResponse.json(
        { error: "Invalid mode" },
        { status: 400 }
      );
    }

    const { data: updated, error: updateError } = await supabase
      .from("inventory")
      .update({ quantity: newQuantity })
      .eq("id", inventoryId)
      .select(
        `
        id,
        name,
        strain_type,
        quantity,
        low_stock_threshold,
        batch_id,
        batch:batches (
          expires_on,
          production_run,
          remaining_units
        )
      `
      )
      .single();

    if (updateError) {
      return NextResponse.json(
        { error: updateError.message },
        { status: 400 }
      );
    }

    // ⚠️ The trigger you created will automatically recompute
    // batches.remaining_units based on SUM(inventory.quantity)
    // for that batch_id. No extra work needed here.

    return NextResponse.json({ item: updated });
  } catch (err: any) {
    console.error("[inventory/adjust] error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
