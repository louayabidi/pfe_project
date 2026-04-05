export interface Badge {
  id: number;
  name: string;
  description?: string;
  imageUrl?: string;
  hidden: boolean;
  maxAwardsPerUser?: number;
  createdAt: string;
}

export interface CreateBadgeRequest {
  name: string;
  description?: string;
  imageUrl?: string;
  hidden?: boolean;
  maxAwardsPerUser?: number;
}