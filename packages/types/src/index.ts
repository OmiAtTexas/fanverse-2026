// ============================
// FanVerse 2026 — Shared Types
// ============================

export interface User {
  id: string;
  clerkId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  bio?: string;
  nationality?: string;
  supportedTeam?: string;
  languages: string[];
  interests: string[];
  visitingCities: string[];
  ageRange?: string;
  travelDatesStart?: Date;
  travelDatesEnd?: Date;
  instagram?: string;
  twitter?: string;
  isActive: boolean;
  lastActiveAt: Date;
  createdAt: Date;
}

export interface WorldCupMatch {
  id: string;
  matchNumber: number;
  homeTeam: string;
  awayTeam: string;
  homeTeamCode: string;
  awayTeamCode: string;
  homeScore?: number;
  awayScore?: number;
  kickoffAt: Date;
  venue: string;
  citySlug: string;
  cityName: string;
  stage: MatchStage;
  status: MatchStatus;
  groupName?: string;
}

export type MatchStage = 'GROUP' | 'ROUND_OF_32' | 'ROUND_OF_16' | 'QUARTERFINAL' | 'SEMIFINAL' | 'THIRD_PLACE' | 'FINAL';
export type MatchStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'POSTPONED';

export interface Group {
  id: string;
  name: string;
  description: string;
  citySlug: string;
  teamFocus?: string;
  imageUrl?: string;
  memberCount: number;
  createdById: string;
  createdAt: Date;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'LOCATION' | 'SYSTEM';
  createdAt: Date;
  sender?: Pick<User, 'id' | 'firstName' | 'avatarUrl'>;
}

export interface Passport {
  id: string;
  userId: string;
  stamps: Stamp[];
  stats: PassportStats;
}

export interface Stamp {
  id: string;
  passportId: string;
  type: StampType;
  title: string;
  metadata?: Record<string, unknown>;
  earnedAt: Date;
}

export type StampType = 'MATCH_ATTENDED' | 'CITY_VISITED' | 'GROUP_JOINED' | 'MEETUP_ATTENDED' | 'FAN_MET' | 'JOURNEY_COMPLETE';

export interface PassportStats {
  matches: number;
  cities: number;
  fans: number;
  meetups: number;
}

export interface MatchSuggestion {
  user: User;
  score: number;
  reasons: string[];
  icebreaker: string;
  sharedMatches: WorldCupMatch[];
}

export interface Itinerary {
  id: string;
  userId: string;
  citySlug: string;
  title: string;
  hoursAvailable: number;
  generatedAt: Date;
  items: ItineraryItem[];
}

export interface ItineraryItem {
  time: string;
  title: string;
  description: string;
  location?: string;
  lat?: number;
  lng?: number;
  duration: number;
  category: 'FOOD' | 'ATTRACTION' | 'TRANSPORT' | 'MATCH' | 'ACCOMMODATION';
}

export interface HostCity {
  slug: string;
  name: string;
  country: 'USA' | 'Canada' | 'Mexico';
  state?: string;
  stadiumName: string;
  stadiumCapacity: number;
  description: string;
  tips: Record<string, string[]>;
  transportInfo: Record<string, string>;
  safetyInfo: string[];
  timezone: string;
  currency: string;
  languages: string[];
  weatherJune?: string;
  imageUrl?: string;
}

// API Response wrappers
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

export interface ApiError {
  statusCode: number;
  message: string;
  timestamp: string;
  path: string;
}
