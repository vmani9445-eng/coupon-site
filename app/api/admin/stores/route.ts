import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(Number(searchParams.get("page") || "1"), 1);
    const limit = 40;
    const search = (searchParams.get("search") || "").trim();

    const where = search
      ? {
          OR: [
            {
              name: {
                contains: search,
              },
            },
            {
              slug: {
                contains: search,
              },
            },
          ],
        }
      : {};

    const [totalStores, stores] = await Promise.all([
      prisma.store.count({ where }),
      prisma.store.findMany({
        where,
        orderBy: {
          createdAt: "desc",
        },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: {
            select: {
              coupons: true,
              cashbackOffers: true,
              clickLogs: true,
              cashbackTransactions: true,
            },
          },
        },
      }),
    ]);

    return NextResponse.json({
      stores,
      pagination: {
        page,
        limit,
        totalStores,
        totalPages: Math.max(Math.ceil(totalStores / limit), 1),
        hasPrevPage: page > 1,
        hasNextPage: page < Math.max(Math.ceil(totalStores / limit), 1),
      },
    });
  } catch (error) {
    console.error("ADMIN_STORES_GET_ERROR", error);

    return NextResponse.json(
      { error: "Failed to load stores" },
      { status: 500 }
    );
  }
}