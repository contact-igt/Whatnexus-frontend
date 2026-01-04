export const formatDateRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  const month = s.toLocaleString('en-US', { month: 'long' });
  const d1 = s.getDate();
  const d2 = e.getDate();
  return d1 === d2 ? `${d1} ${month}` : `${d1} ${month} to ${d2} ${month}`;
};

export const formatTimeRange = (start: string, end: string) => {
  const format = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    const period = h >= 12 ? 'pm' : 'am';
    const hour12 = h % 12 || 12;
    const min = m.toString().padStart(2, '0');
    return `${hour12}:${min}${period}`;
  };
  return `${format(start)}-${format(end)}`;
};


// src/utils/dateUtils.ts
export function formatAddDate(iso: string): string {
  const d = new Date(iso);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatAddTime(iso: string): string {
  const d = new Date(iso);
  const h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function splitContactNumber(full: string) {
  const cleaned = full.replace(/[\s-]/g, '');
  const m = cleaned.match(/^(\+\d{1,3})(\d+)$/);
  if (m) {
    return {
      country_code: m[1], 
      phone_number: m[2],
    };
  }
  return {
    country_code: '',
    phone_number: cleaned,
  };
}