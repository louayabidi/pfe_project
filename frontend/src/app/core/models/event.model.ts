export interface IncomingEvent {
  id: number;
  userId: string;
  displayName: string; 
  eventName: string;
  eventData: Record<string, unknown> | null;
  processed: boolean;
  createdAt: string;
}

export interface EventPage {
  content: IncomingEvent[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface EventFilters {
  userId?: string;
  eventName?: string;
  dateFrom?: string;
  dateTo?: string;
  page: number;
  size: number;
}