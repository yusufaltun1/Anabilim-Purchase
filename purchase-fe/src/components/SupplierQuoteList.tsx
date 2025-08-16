import { SupplierQuote } from '../types/purchase-request';
import { formatDate } from '../utils/date';
import { formatCurrency } from '../utils/currency';

interface SupplierQuoteListProps {
  quotes: SupplierQuote[];
  onSelectQuote?: (quoteId: number) => void;
  selectedQuoteId?: number | null;
  showActions?: boolean;
}

export const SupplierQuoteList: React.FC<SupplierQuoteListProps> = ({ 
  quotes, 
  onSelectQuote,
  selectedQuoteId,
  showActions = true
}) => {
  const sortedQuotes = [...quotes].sort((a, b) => {
    // Önce seçili teklifi göster
    if (a.id === selectedQuoteId) return -1;
    if (b.id === selectedQuoteId) return 1;
    
    // Sonra fiyata göre sırala (en düşükten en yükseğe)
    return a.totalPrice - b.totalPrice;
  });

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case 'TRY': return '₺';
      case 'USD': return '$';
      case 'EUR': return '€';
      default: return currency;
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'RESPONDED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RESPONDED':
        return 'Yanıtlandı';
      case 'PENDING':
        return 'Bekliyor';
      case 'REJECTED':
        return 'Reddedildi';
      default:
        return status;
    }
  };

  if (quotes.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Henüz teklif bulunmamaktadır.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Tedarikçi
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Teklif No
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                    Birim Fiyat
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                    Miktar
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900">
                    Toplam Fiyat
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Teslim Tarihi
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Durum
                  </th>
                  {showActions && (
                    <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                      <span className="sr-only">İşlemler</span>
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {sortedQuotes.map((quote) => (
                  <tr key={quote.id} className={quote.id === selectedQuoteId ? 'bg-indigo-50' : undefined}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      <div>
                        <div className="font-medium">{quote.supplier.name}</div>
                        <div className="text-gray-500">{quote.supplier.contactPerson}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <div>
                        <div>{quote.quoteNumber}</div>
                        <div className="text-gray-400">{quote.supplierReference}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">
                      {formatCurrency(quote.unitPrice)} {getCurrencySymbol(quote.currency)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right text-gray-500">
                      {quote.quantity}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-right font-medium text-gray-900">
                      {formatCurrency(quote.totalPrice)} {getCurrencySymbol(quote.currency)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {formatDate(quote.deliveryDate)}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${getStatusBadgeClass(quote.status)}`}>
                        {getStatusText(quote.status)}
                      </span>
                    </td>
                    {showActions && onSelectQuote && (
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        {quote.id === selectedQuoteId ? (
                          <span className="text-green-600">Seçildi</span>
                        ) : (
                          <button
                            onClick={() => onSelectQuote(quote.id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            Seç
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4} className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                    Toplam {quotes.length} teklif
                  </td>
                  <td className="px-3 py-4 text-right text-sm font-medium text-gray-900">
                    En düşük: {formatCurrency(Math.min(...quotes.map(q => q.totalPrice)))} {getCurrencySymbol(quotes[0].currency)}
                  </td>
                  <td colSpan={showActions ? 3 : 2}></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}; 