import { getToken } from './client';

export function exportCSV(params?: { dateFrom?: string; dateTo?: string }): string {
  const searchParams = new URLSearchParams();
  if (params?.dateFrom) searchParams.set('date_from', params.dateFrom);
  if (params?.dateTo) searchParams.set('date_to', params.dateTo);

  const qs = searchParams.toString();
  const url = `/api/v1/export/csv${qs ? `?${qs}` : ''}`;

  const token = getToken();
  const link = document.createElement('a');

  if (token) {
    link.href = `${url}${url.includes('?') ? '&' : '?'}token=${token}`;
  } else {
    link.href = url;
  }

  link.download = `coinkeeper-export-${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  return url;
}
