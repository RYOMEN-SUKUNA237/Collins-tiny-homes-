import { NextResponse } from "next/server";
import { deletePayment } from "@/lib/db";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Failed to delete payment";
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await deletePayment(id);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: getErrorMessage(error) },
      { status: 500 },
    );
  }
}
