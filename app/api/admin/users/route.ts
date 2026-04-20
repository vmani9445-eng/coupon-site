import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const [
      totalUsers,
      activeToday,
      signedInUsers,
      anonymousSessions,
      pendingWithdrawalCount,
      pendingCashbackCount,
      users,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: {
          lastSeenAt: {
            gte: todayStart,
          },
        },
      }),
      prisma.user.count({
        where: {
          sessions: {
            some: {},
          },
        },
      }),
      prisma.userSession.count({
        where: {
          userId: null,
        },
      }),
      prisma.withdrawalRequest.count({
        where: {
          status: "PENDING",
        },
      }),
      prisma.cashbackTransaction.count({
        where: {
          status: {
            in: ["PENDING", "TRACKING"],
          },
        },
      }),
      prisma.user.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 100,
        include: {
          wallet: true,
          cashbackTransactions: true,
          withdrawalRequests: true,
          _count: {
            select: {
              clickLogs: true,
              referrals: true,
              sessions: true,
              supportTickets: true,
            },
          },
        },
      }),
    ]);

    const formattedUsers = users.map((user) => {
      const pendingCashback = user.cashbackTransactions
        .filter((item) => item.status === "PENDING" || item.status === "TRACKING")
        .reduce((sum, item) => sum + item.cashbackAmount, 0);

      const confirmedCashback = user.cashbackTransactions
        .filter(
          (item) =>
            item.status === "CONFIRMED" ||
            item.status === "PAYABLE" ||
            item.status === "PAID"
        )
        .reduce((sum, item) => sum + item.cashbackAmount, 0);

      const rejectedCashback = user.cashbackTransactions
        .filter((item) => item.status === "REJECTED")
        .reduce((sum, item) => sum + item.cashbackAmount, 0);

      const pendingWithdrawal = user.withdrawalRequests
        .filter((item) => item.status === "PENDING")
        .reduce((sum, item) => sum + item.amount, 0);

      const paidWithdrawal = user.withdrawalRequests
        .filter((item) => item.status === "PAID")
        .reduce((sum, item) => sum + item.amount, 0);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        status: user.status,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastSeenAt: user.lastSeenAt,
        referralCode: user.referralCode,
        upiId: user.upiId,
        upiName: user.upiName,
        giftCardPreference: user.giftCardPreference,
        wallet: {
          pendingBalance: user.wallet?.pendingBalance ?? 0,
          confirmedBalance: user.wallet?.confirmedBalance ?? 0,
          availableBalance: user.wallet?.availableBalance ?? 0,
          lifetimeEarned: user.wallet?.lifetimeEarned ?? 0,
          lifetimeWithdrawn: user.wallet?.lifetimeWithdrawn ?? 0,
          lifetimeRejected: user.wallet?.lifetimeRejected ?? 0,
        },
        cashback: {
          pending: pendingCashback,
          confirmed: confirmedCashback,
          rejected: rejectedCashback,
        },
        withdrawals: {
          pending: pendingWithdrawal,
          paid: paidWithdrawal,
        },
        counts: {
          clicks: user._count.clickLogs,
          referrals: user._count.referrals,
          sessions: user._count.sessions,
          supportTickets: user._count.supportTickets,
        },
      };
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        activeToday,
        signedInUsers,
        anonymousSessions,
        pendingWithdrawalCount,
        pendingCashbackCount,
      },
      users: formattedUsers,
    });
  } catch (error) {
    console.error("ADMIN_USERS_GET_ERROR", error);
    return NextResponse.json(
      { error: "Failed to fetch admin users data" },
      { status: 500 }
    );
  }
}