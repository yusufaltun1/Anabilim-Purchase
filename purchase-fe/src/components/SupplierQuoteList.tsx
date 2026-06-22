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

const getCurrencySymbol = (currency: string) => {
  switch (currency) {
    case 'TRY':
      return '₺';
    case 'USD':
      return '$';
    case 'EUR':
      return '€';
    default:
      return currency;
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
    case 'CONVERTED_TO_ORDER':
      return 'bg-blue-100 text-blue-800';
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
    case 'CONVERTED_TO_ORDER':
      return 'Siparişe Dönüştü';
    default:
      return status;
  }
};

const hasCounterOffer = (quote: SupplierQuote) =>
  quote.counterOfferQuantity != null || quote.counterOfferUnitPrice != null;

const getCounterOfferTotal = (quote: SupplierQuote): number | null => {
  if (quote.counterOfferQuantity == null || quote.counterOfferUnitPrice == null) {
    return null;
  }
  return quote.counterOfferQuantity * quote.counterOfferUnitPrice;
};

export const SupplierQuoteList: React.FC<SupplierQuoteListProps> = ({
  quotes,
  selectedQuoteId,
  showActions = true,
  onConvertToOrder,
  onEditQuote,
  onEnterCounterOffer,
  onEditQuoteFromCounterOffer,
}) => {
  const sortedQuotes = [...quotes].sort((a, b) => {
    if (a.id === selectedQuoteId) return -1;
    if (b.id === selectedQuoteId) return 1;
    return a.totalPrice - b.totalPrice;
  });

  if (quotes.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Henüz teklif bulunmamaktadır.</p>
      </div>
    );
  }

  const thBase = 'py-2 px-2 font-semibold text-gray-900';
  const thSub = 'py-1.5 px-2 text-xs font-medium text-gray-600';
  const tdBase = 'py-2.5 px-2 whitespace-nowrap';
  const tdRight = `${tdBase} text-right tabular-nums`;

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-[960px] w-full divide-y divide-gray-300 text-sm">
        <thead>
          <tr className="bg-gray-50">
            <th scope="col" rowSpan={2} className={`${thBase} pl-3 pr-2 text-left align-bottom`}>
              Tedarikçi
            </th>
            <th scope="col" rowSpan={2} className={`${thBase} text-left align-bottom`}>
              Teklif No
            </th>
            <th
              scope="col"
              colSpan={3}
              className={`${thBase} text-center border-l border-gray-200 bg-slate-50/80`}
            >
              Tedarikçi teklifi
            </th>
            <th
              scope="col"
              colSpan={3}
              className={`${thBase} text-center border-l border-indigo-200 bg-indigo-50/60 text-indigo-900`}
            >
              Karşı teklif
            </th>
            <th scope="col" rowSpan={2} className={`${thBase} text-left align-bottom border-l border-gray-200`}>
              Teslim
            </th>
            <th scope="col" rowSpan={2} className={`${thBase} text-left align-bottom`}>
              Durum
            </th>
            {showActions && (
              <th scope="col" rowSpan={2} className={`${thBase} pr-3 text-right align-bottom`}>
                İşlemler
              </th>
            )}
          </tr>
          <tr className="bg-gray-50/90">
            <th scope="col" className={`${thSub} text-right border-l border-gray-200 bg-slate-50/80`}>
              Birim fiyat
            </th>
            <th scope="col" className={`${thSub} text-right bg-slate-50/80`}>
              Miktar
            </th>
            <th scope="col" className={`${thSub} text-right bg-slate-50/80`}>
              Toplam
            </th>
            <th scope="col" className={`${thSub} text-right border-l border-indigo-200 bg-indigo-50/60 text-indigo-800`}>
              Birim fiyat
            </th>
            <th scope="col" className={`${thSub} text-right bg-indigo-50/60 text-indigo-800`}>
              Miktar
            </th>
            <th scope="col" className={`${thSub} text-right bg-indigo-50/60 text-indigo-800`}>
              Toplam
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedQuotes.map((quote) => {
            const currencySymbol = getCurrencySymbol(quote.currency);
            const counterTotal = getCounterOfferTotal(quote);
            const counterFilled = hasCounterOffer(quote);
            const canEnter =
              onEnterCounterOffer && quote.status === 'RESPONDED' && quote.quoteUid && !counterFilled;

            return (
              <tr key={quote.id} className={quote.id === selectedQuoteId ? 'bg-indigo-50/40' : undefined}>
                <td className={`${tdBase} pl-3 pr-2`}>
                  <div className="font-medium text-gray-900 max-w-[140px] truncate" title={quote.supplier.name}>
                    {quote.supplier.name}
                  </div>
                  {quote.supplier.contactPerson && (
                    <div
                      className="text-gray-500 text-xs max-w-[140px] truncate"
                      title={quote.supplier.contactPerson}
                    >
                      {quote.supplier.contactPerson}
                    </div>
                  )}
                </td>
                <td className={`${tdBase} text-gray-500`}>{quote.quoteNumber || '—'}</td>

                <td className={`${tdRight} text-gray-600 border-l border-gray-100 bg-slate-50/30`}>
                  {formatCurrency(quote.unitPrice)} {currencySymbol}
                </td>
                <td className={`${tdRight} text-gray-600 bg-slate-50/30`}>{quote.quantity}</td>
                <td className={`${tdRight} font-medium text-gray-900 bg-slate-50/30`}>
                  {formatCurrency(quote.totalPrice)} {currencySymbol}
                </td>

                {counterFilled ? (
                  <>
                    <td className={`${tdRight} border-l border-indigo-100 bg-indigo-50/25 text-indigo-900 font-medium`}>
                      {quote.counterOfferUnitPrice != null
                        ? `${formatCurrency(quote.counterOfferUnitPrice)} ${currencySymbol}`
                        : '—'}
                    </td>
                    <td className={`${tdRight} bg-indigo-50/25 text-indigo-900 font-medium`}>
                      {quote.counterOfferQuantity ?? '—'}
                    </td>
                    <td className={`${tdRight} bg-indigo-50/25`}>
                      <div className="text-indigo-900 font-semibold">
                        {counterTotal != null ? `${formatCurrency(counterTotal)} ${currencySymbol}` : '—'}
                      </div>
                      {onEditQuoteFromCounterOffer && (
                        <button
                          type="button"
                          onClick={() => onEditQuoteFromCounterOffer(quote)}
                          className="mt-0.5 text-xs font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                          title="Karşı teklifi ana teklife uygulamak için tıklayın"
                        >
                          Ana teklife uygula
                        </button>
                      )}
                      {quote.counterOfferEnteredAt && (
                        <div className="mt-0.5 text-[11px] text-indigo-500/80">
                          {formatDate(quote.counterOfferEnteredAt)}
                        </div>
                      )}
                    </td>
                  </>
                ) : canEnter ? (
                  <td colSpan={3} className="border-l border-indigo-100 bg-indigo-50/20 px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => onEnterCounterOffer(quote)}
                      className="inline-flex items-center rounded-md border border-indigo-200 bg-white px-2.5 py-1 text-xs font-medium text-indigo-700 shadow-sm hover:bg-indigo-50"
                    >
                      Karşı teklif gir
                    </button>
                  </td>
                ) : (
                  <>
                    <td className={`${tdRight} border-l border-indigo-100 bg-indigo-50/10 text-gray-400`}>—</td>
                    <td className={`${tdRight} bg-indigo-50/10 text-gray-400`}>—</td>
                    <td className={`${tdRight} bg-indigo-50/10 text-gray-400`}>—</td>
                  </>
                )}

                <td className={`${tdBase} text-gray-500 border-l border-gray-100`}>
                  {formatDate(quote.deliveryDate)}
                </td>
                <td className={tdBase}>
                  <span
                    className={`inline-flex items-center rounded px-1.5 py-0.5 text-xs font-medium ${getStatusBadgeClass(quote.status)}`}
                  >
                    {getStatusText(quote.status)}
                  </span>
                </td>
                {showActions && (
                  <td className={`${tdBase} pr-3 text-right`}>
                    {onEditQuote && quote.status !== 'CONVERTED_TO_ORDER' && (
                      <button
                        type="button"
                        onClick={() => onEditQuote(quote)}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium mr-2"
                      >
                        {quote.status === 'PENDING' ? 'Teklif Gir' : 'Güncelle'}
                      </button>
                    )}
                    {onConvertToOrder && quote.status === 'RESPONDED' && (
                      <button
                        type="button"
                        onClick={() => onConvertToOrder(quote)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      >
                        Siparişe Dönüştür
                      </button>
                    )}
                    {quote.status === 'CONVERTED_TO_ORDER' && (
                      <span className="text-green-600 text-xs">Sipariş Verildi</span>
                    )}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
