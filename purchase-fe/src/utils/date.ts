export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) {
    return '-';
  }
  
  const date = new Date(dateString);
  
  // Geçersiz tarih kontrolü
  if (isNaN(date.getTime())) {
    return '-';
  }
  
  return new Intl.DateTimeFormat('tr-TR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
};

/** HTML date input (YYYY-MM-DD) — yerel saat diliminde yarın */
export const getTomorrowInputDate = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}; 