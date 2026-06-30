export type Period = '1W' | '1M' | '3M' | 'YTD';

export interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export type WeekDay = { date: Date; pnl: number; count: number };
