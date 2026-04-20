import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const body = await req.json();

    const cashbackPercentToUser = Number(body?.cashbackPercentToUser);

    if (
      Number.isNaN(cashbackPercentToUser) ||
      cashbackPercentToUser < 0 ||
      cashbackPercentToUser > 100
    ) {
      return NextResponse.json(
        { error: "Cashback percent must be between 0 and 100." },
        { status: 400 }
      );
    }

    const updatedStore = await prisma.store.update({
      where: { id },
      data: {
        cashbackPercentToUser,
      },
    });

    return NextResponse.json({ store: updatedStore });
  } catch (error) {
    console.error("ADMIN_STORE_CASHBACK_PATCH_ERROR", error);

    return NextResponse.json(
      { error: "Failed to update cashback control" },
      { status: 500 }
    );
  }
}