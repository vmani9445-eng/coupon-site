import { prisma } from "@/lib/prisma";

export default async function AdminSubmissionsPage() {
  const submissions = await prisma.couponSubmission.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="pageContainer">
      <section className="adminCard">
        <h1>Coupon Submissions</h1>

        <div className="adminList">
          {submissions.map((item) => (
            <div key={item.id} className="adminItem">
              <h3>{item.title}</h3>
              <p>{item.storeName}</p>
              <p>Status: {item.status}</p>
              <p>{item.code || "No code"}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}