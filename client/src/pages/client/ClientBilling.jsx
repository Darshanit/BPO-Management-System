import { useQuery } from '@tanstack/react-query';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import DocumentManager from '../../components/ui/DocumentManager';
import { clientService } from '../../services';

export default function ClientBilling() {
  const { data: profile, isLoading } = useQuery({
    queryKey: ['my-client-profile'],
    queryFn: () => clientService.getMyProfile().then((res) => res.data.data),
  });

  return (
    <div className="space-y-6">
      <h1 className="font-display font-bold text-2xl">Invoices & Documents</h1>

      <Card>
        <h3 className="font-display font-bold text-lg mb-4">Invoices</h3>
        {isLoading ? (
          <p className="text-black/50">Loading...</p>
        ) : !profile?.invoices?.length ? (
          <p className="text-black/50">No invoices yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-black/10 text-left text-xs uppercase font-bold text-black/50">
                  <th className="py-2">Invoice #</th>
                  <th className="py-2">Amount</th>
                  <th className="py-2">Due Date</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {profile.invoices.map((inv, idx) => (
                  <tr key={idx} className="border-b border-black/5">
                    <td className="py-2 font-semibold">{inv.invoiceNumber}</td>
                    <td className="py-2">₹{inv.amount?.toLocaleString()}</td>
                    <td className="py-2">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '—'}</td>
                    <td className="py-2">
                      <Badge status={inv.status}>{inv.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {profile?._id && <DocumentManager relatedKind="Client" relatedId={profile._id} />}
    </div>
  );
}
