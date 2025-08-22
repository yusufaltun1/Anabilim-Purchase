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