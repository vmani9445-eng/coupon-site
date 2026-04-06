import { prisma } from "@/lib/prisma";

export default async function AdminCashbackPage() {
  const offers = await prisma.cashbackOffer.findMany({
    include: {
      store: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="adminPage">
      <div className="adminPageHeader">
        <div>
          <h1>Cashback</h1>
          <p>Manage cashback offers.</p>
        </div>
        <button className="adminButton">Add Cashback</button>
      </div>

      <div className="adminTableWrap">
        <table className="adminTable">
          <thead>
            <tr>
              <th>Title</th>
              <th>Store</th>
              <th>Type</th>
              <th>Value</th>
              <th>Source</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id}>
                <td>{offer.title}</td>
                <td>{offer.store.name}</td>
                <td>{offer.cashbackType}</td>
                <td>
                  {offer.cashbackType === "percent"
                    ? `${offer.cashbackValue}%`
                    : `₹${offer.cashbackValue}`}
                </td>
                <td>{offer.source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}