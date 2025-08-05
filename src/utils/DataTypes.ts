import { PhoneIdentifier } from 'firebase-admin/lib/auth/identifier';

export interface authUserRegister {
  id?: number;
  name: string;
  roll: string;
  lastName: string;
  userEmail: string;
  userPassword: string;
  create_at: string;
  update_at: string;
  delete_at: string;
  status: boolean;
}
export interface User {
  name: string;
  lastName: string;
  userEmail: string;
  userPassword: string;
  roll: string;
  create_at?: string;
  update_at?: string;
  delete_at?: string;
  status?: boolean;
}

export interface UpdateUser {
  name?: string;
  lastName?: string;
  userEmail?: string;
  userPassword?: string;
  phone: PhoneIdentifier;
  roll?: string;
  create_at?: string;
  update_at?: string;
  delete_at?: string;
  status?: boolean;
}

export interface eventData {
  organizerId: string;
  title: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
  musicianPreferences: string[];
  budget: number;
}

export type EventAlert = {
  id: string; // ID único de la alerta
  eventId: string; // ID del evento relacionado
  title: string; // Título del evento
  description?: string; // Descripción opcional
  location: string; // Lugar del evento
  startDateTime: string; // Fecha/hora inicio (ISO string)
  endDateTime: string; // Fecha/hora fin (ISO string)
  organizerId: string; // UID del organizador
  musicianId: string; // UID del músico que recibe la alerta
  createdAt: string; // Fecha de creación de la alerta
  status: 'pending' | 'accepted' | 'declined'; // Estado
  calendarEventId?: string; // ID del evento en Google Calendar (si se agregó)
};

export interface Event {
  id: string; // ID de Firestore
  user: string; // Email del organizador
  eventName: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  duration: string;
  instrument: string;
  bringInstrument: boolean;
  comment: string;
  budget: string;
  flyerUrl?: string;
  songs: string[];
  recommendations: string[];
  mapsLink: string;
  status:
    | 'pending_musician'
    | 'musician_assigned'
    | 'completed'
    | 'cancelled'
    | 'musician_cancelled';
  assignedMusicianId?: string;
  interestedMusicians?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface FileMetadata {
  key: string;
  url: string;
  size: number;
  mimetype: string;
  originalName: string;
}

// Image System Types
export interface Image {
  id: string;
  key: string; // S3 key
  url: string; // Signed URL
  originalName: string;
  fileName: string;
  size: number;
  mimetype: string;
  category: 'profile' | 'post' | 'event' | 'gallery' | 'admin';
  userId: string; // Owner of the image
  description?: string;
  tags?: string[];
  metadata?: Record<string, any>;
  isPublic: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string; // For temporary URLs
}

export interface ImageUploadRequest {
  category: 'profile' | 'post' | 'event' | 'gallery' | 'admin';
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  metadata?: Record<string, any>;
}

export interface ImageUpdateRequest {
  description?: string;
  tags?: string[];
  isPublic?: boolean;
  metadata?: Record<string, any>;
  isActive?: boolean;
}

export interface ImageFilters {
  category?: 'profile' | 'post' | 'event' | 'gallery' | 'admin';
  userId?: string;
  isPublic?: boolean;
  isActive?: boolean;
  tags?: string[];
  dateFrom?: string;
  dateTo?: string;
  search?: string;
  limit?: number;
  offset?: number;
  metadata?: Record<string, any>;
}

export interface ImageStats {
  totalImages: number;
  totalSize: number;
  imagesByCategory: Record<string, number>;
  imagesByUser: Record<string, number>;
  recentUploads: Image[];
}

// Chat Types
export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  status: 'sent' | 'delivered' | 'read';
  type: 'text' | 'image' | 'audio' | 'file';
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: Message;
  unreadCount: number;
  updatedAt: string;
  isActive: boolean;
  createdAt: string;
}

export interface ChatFilters {
  search?: string;
  unreadOnly?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

// Interfaces para búsqueda de músicos
export interface EventRequest {
  id: string;
  eventName: string;
  eventType: string;
  date: string;
  time: string;
  location: string;
  duration: string;
  instrument: string;
  budget: string;
  description?: string;
  requirements?: string;
}

export interface Musician {
  userEmail: string;
  name: string;
  lastName: string;
  instruments: string[];
  hasOwnInstruments: boolean;
  experience: number;
  bio?: string;
  location: string;
  hourlyRate: number;
  isApproved: boolean;
  isAvailable: boolean;
  phone?: string;
  socialMedia?: Record<string, string>;
  rating: number;
  totalEvents: number;
  completedEvents: number;
}

export interface MusicianSearchRequest {
  eventId: string;
  instrument: string;
  location?: string;
  budget?: number;
  date?: string;
  time?: string;
  duration?: string;
  eventType?: string;
  maxDistance?: number;
}

export interface MusicianSearchResponse {
  userEmail: string;
  name: string;
  lastName: string;
  instruments: string[];
  hasOwnInstruments: boolean;
  experience: number;
  hourlyRate: number;
  location: string;
  isAvailable: boolean;
  rating: number;
  distance?: number;
  matchScore: number;
  availability: {
    isAvailable: boolean;
    conflicts: string[];
  };
}

export interface BankDeposit {
  id: string;
  userEmail: string;
  amount: number;
  currency: string;
  depositDate: Date;
  bankName: string;
  accountNumber: string;
  reference: string;
  purpose: string;
  voucherUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  reviewedBy?: string;
  reviewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  isDuplicate?: boolean;
  duplicateOf?: string;
}

export interface BankAccount {
  id: string;
  accountName: string;
  accountNumber: string;
  bankName: string;
  accountType: 'savings' | 'checking';
  isActive: boolean;
  createdAt: Date;
}

export interface DepositRequest {
  amount: number;
  currency: string;
  depositDate: Date;
  bankName: string;
  accountNumber: string;
  reference: string;
  purpose: string;
  voucherFile: Express.Multer.File;
}

export interface DepositApproval {
  depositId: string;
  action: 'approve' | 'reject';
  reason?: string;
  adminEmail: string;
}
