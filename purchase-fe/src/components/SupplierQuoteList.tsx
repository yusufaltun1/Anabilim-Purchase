import { SupplierQuote } from '../types/purchase-request';
import { formatDate } from '../utils/date';
import { formatCurrency } from '../utils/currency';

interface SupplierQuoteListProps {
  quotes: SupplierQuote[];
  onSelectQuote?: (quoteId: number) => void;
  selectedQuoteId?: number | null;
  showActions?: boolean;
  onConvertToOrder?: (quote: SupplierQuote) => void;
  onEditQuote?: (quote: SupplierQuote) => void;
  /** İlgili teklif satırı için karşı teklif girişi */
  onEnterCounterOffer?: (quote: SupplierQuote) => void;
  /** Karşı teklif hücresine tıklanınca güncelleme modalını karşı teklif değerleriyle açar */
  onEditQuoteFromCounterOffer?: (quote: SupplierQuote) => void;
}

export const SupplierQuoteList: React.FC<SupplierQuoteListProps> = ({ 
  quotes, 
  onSelectQuote,
  selectedQuoteId,
  showActions = true,
  onConvertToOrder,
  onEditQuote,
  onEnterCounterOffer,
  onEditQuoteFromCounterOffer
}) => {
  const sortedQuotes = [...quotes].sort((a, b) => {
    if (a.id === selectedQuoteId) return -1;
    if (b.id === selectedQuoteId) return 1;
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
      case 'RESPONDED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'CONVERTED_TO_ORDER': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'RESPONDED': return 'Yanıtlandı';
      case 'PENDING': return 'Bekliyor';
      case 'REJECTED': return 'Reddedildi';
      case 'CONVERTED_TO_ORDER': return 'Siparişe Dönüştü';
      default: return status;
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
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-[720px] w-full divide-y divide-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th scope="col" className="py-2.5 pl-3 pr-2 text-left font-semibold text-gray-900">Tedarikçi</th>
            <th scope="col" className="py-2.5 px-2 text-left font-semibold text-gray-900">Teklif No</th>
            <th scope="col" className="py-2.5 px-2 text-right font-semibold text-gray-900">Birim Fiyat</th>
            <th scope="col" className="py-2.5 px-2 text-right font-semibold text-gray-900">Miktar</th>
            <th scope="col" className="py-2.5 px-2 text-right font-semibold text-gray-900">Toplam</th>
            <th scope="col" className="py-2.5 px-2 text-left font-semibold text-gray-900">Teslim</th>
            <th scope="col" className="py-2.5 px-2 text-left font-semibold text-gray-900">Durum</th>
            <th scope="col" className="py-2.5 px-2 text-left font-semibold text-gray-900 whitespace-nowrap">Karşı teklif</th>
            {showActions && <th scope="col" className="py-2.5 pl-2 pr-3 text-right font-semibold text-gray-900">İşlemler</th>}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedQuotes.map((quote) => (
            <tr key={quote.id} className={quote.id === selectedQuoteId ? 'bg-indigo-50' : undefined}>
              <td className="py-2.5 pl-3 pr-2 whitespace-nowrap">
                <div className="font-medium text-gray-900 max-w-[120px] truncate" title={quote.supplier.name}>{quote.supplier.name}</div>
                {quote.supplier.contactPerson && (
                  <div className="text-gray-500 text-xs max-w-[120px] truncate" title={quote.supplier.contactPerson}>{quote.supplier.contactPerson}</div>
                )}
              </td>
              <td className="py-2.5 px-2 whitespace-nowrap text-gray-500">{quote.quoteNumber}</td>
              <td className="py-2.5 px-2 whitespace-nowrap text-right text-gray-500">{formatCurrency(quote.unitPrice)} {getCurrencySymbol(quote.currency)}</td>
              <td className="py-2.5 px-2 whitespace-nowrap text-right text-gray-500">{quote.quantity}</td>
              <td className="py-2.5 px-2 whitespace-nowrap text-right font-medium text-gray-900">{formatCurrency(quote.totalPrice)} {getCurrencySymbol(quote.currency)}</td>
              <td className="py-2.5 px-2 whitespace-nowrap text-gray-500">{formatDate(quote.deliveryDate)}</td>
              <td className="py-2.5 px-2 whitespace-nowrap">
                <span className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(quote.status)}`}>
                  {getStatusText(quote.status)}
                </span>
              </td>
              <td className="py-2.5 px-2 whitespace-nowrap">
                {quote.counterOfferQuantity != null || quote.counterOfferUnitPrice != null ? (
                  onEditQuoteFromCounterOffer ? (
                    <button
                      type="button"
                      onClick={() => onEditQuoteFromCounterOffer(quote)}
                      className="inline-flex flex-wrap items-center gap-x-1 rounded px-1.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 max-w-[160px] hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1 cursor-pointer text-left"
                      title="Karşı teklifi ana teklife uygulamak için tıklayın"
                    >
                      <span>Karşı teklif var</span>
                      {quote.counterOfferQuantity != null && quote.counterOfferUnitPrice != null && (
                        <span className="font-normal">({quote.counterOfferQuantity}, {formatCurrency(quote.counterOfferUnitPrice)} ₺)</span>
                      )}
                    </button>
                  ) : (
                    <span className="inline-flex flex-wrap items-center gap-x-1 rounded px-1.5 py-0.5 text-xs font-medium bg-indigo-100 text-indigo-800 max-w-[160px]">
                      <span>Karşı teklif var</span>
                      {quote.counterOfferQuantity != null && quote.counterOfferUnitPrice != null && (
                        <span className="font-normal">({quote.counterOfferQuantity}, {formatCurrency(quote.counterOfferUnitPrice)} ₺)</span>
                      )}
                    </span>
                  )
                ) : onEnterCounterOffer && quote.status === 'RESPONDED' && quote.quoteUid ? (
                  <button
                    type="button"
                    onClick={() => onEnterCounterOffer(quote)}
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-800 whitespace-nowrap"
                  >
                    Karşı teklif gir
                  </button>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              {showActions && (
                <td className="py-2.5 pl-2 pr-3 whitespace-nowrap text-right">
                  {onEditQuote && quote.status !== 'CONVERTED_TO_ORDER' && (
                    <button
                      onClick={() => onEditQuote(quote)}
                      className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-2"
                    >
                      {quote.status === 'PENDING' ? 'Teklif Gir' : 'Güncelle'}
                    </button>
                  )}
                  {onConvertToOrder && quote.status === 'RESPONDED' && (
                    <button onClick={() => onConvertToOrder(quote)} className="text-indigo-600 hover:text-indigo-800 text-xs font-medium">
                      Siparişe Dönüştür
                    </button>
                  )}
                  {quote.status === 'CONVERTED_TO_ORDER' && <span className="text-green-600 text-xs">Sipariş Verildi</span>}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};