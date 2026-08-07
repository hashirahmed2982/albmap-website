export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  profileImageUrl: string | null;
  role: "business" | "admin";
  isEmailVerified: boolean;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface ApiErrorResponse {
  message: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type BusinessStatus = "pending" | "approved" | "rejected";

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  description: string | null;
  category: string;
  streetAddress: string;
  city: string;
  postalCode: string;
  country: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  phone: string | null;
  whatsappNumber: string | null;
  logoUrl: string | null;
  openingHours: Record<string, string>;
  tags: string[];
  status: BusinessStatus;
  rating: number | null;
  ratingCount: number;
  distanceKm?: number;
}

export interface EventItem {
  id: string;
  businessId: string;
  businessName: string;
  name: string;
  description: string | null;
  category: string;
  startTime: string;
  endTime: string;
  imageUrl: string | null;
  /** Only populated by endpoints that join event_interests (getEvents/
   * getEventById) — absent elsewhere. Matches the mobile app's
   * EventEntity.interestCount/isInterested. */
  interestCount?: number;
  isInterested?: boolean;
}

export interface Category {
  name: string;
  iconName: string | null;
}

export interface Review {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface AppNotification {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  type: string;
  relatedId: string | null;
  businessName: string | null;
}

export interface BusinessAnalytics {
  businessId: string;
  profileClicks: number;
  websiteClicks: number;
  callClicks: number;
  favoriteCount: number;
  last7DaysProfileClicks: number[];
}
