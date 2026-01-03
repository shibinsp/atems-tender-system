import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function formatDate(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd MMM yyyy');
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    return format(parseISO(dateString), 'dd MMM yyyy, hh:mm a');
  } catch {
    return dateString;
  }
}

export function formatRelativeTime(dateString: string | undefined | null): string {
  if (!dateString) return '-';
  try {
    return formatDistanceToNow(parseISO(dateString), { addSuffix: true });
  } catch {
    return dateString;
  }
}

export function formatCurrency(
  amount: number | undefined | null,
  currency: string = 'INR'
): string {
  if (amount === undefined || amount === null) return '-';

  const formatter = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  });

  return formatter.format(amount);
}

export function formatNumber(value: number | undefined | null): string {
  if (value === undefined || value === null) return '-';

  return new Intl.NumberFormat('en-IN').format(value);
}

export function formatScore(score: number | undefined | null): string {
  if (score === undefined || score === null) return '-';
  return score.toFixed(2);
}

export function formatPercentage(value: number | undefined | null): string {
  if (value === undefined || value === null) return '-';
  return `${value.toFixed(1)}%`;
}

export function formatFileSize(bytes: number | undefined | null): string {
  if (!bytes) return '-';

  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

export function truncateText(text: string, maxLength: number = 100): string {
  if (!text || text.length <= maxLength) return text || '';
  return `${text.substring(0, maxLength)}...`;
}

export function generateTenderId(): string {
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `TND-${timestamp}-${random}`;
}

export function getDaysRemaining(deadline: string | undefined | null): number {
  if (!deadline) return 0;
  try {
    const deadlineDate = parseISO(deadline);
    const now = new Date();
    const diff = deadlineDate.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}

export function getDeadlineStatus(deadline: string | undefined | null): 'urgent' | 'warning' | 'normal' | 'passed' {
  const days = getDaysRemaining(deadline);
  if (days < 0) return 'passed';
  if (days <= 2) return 'urgent';
  if (days <= 7) return 'warning';
  return 'normal';
}
