import { auth } from "@/auth";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const nextAuthSession = await auth();
  const legacySession = await getSession();

  const isLoggedInWithGoogle = !!nextAuthSession?.user;
  const isLoggedInWithEmailPassword = !!legacySession?.userId;

  if (!isLoggedInWithGoogle && !isLoggedInWithEmailPassword) {
    redirect("/login");
  }

  return <>{children}</>;
}