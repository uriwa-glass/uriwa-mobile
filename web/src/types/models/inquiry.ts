export type InquiryStatus = "pending" | "in-review" | "answered" | "closed";

export type InquiryPriority = "low" | "medium" | "high";

export type InquiryCategory =
  | "general"
  | "reservation"
  | "payment"
  | "class"
  | "technical"
  | "other";

export interface UserInquiryMessage {
  id: string;
  inquiry_id: string;
  sender_id: string;
  is_admin: boolean;
  content: string;
  attachment_urls?: string[];
  created_at: string;
  updated_at: string;
  read_at: string | null;
}

export interface UserInquiry {
  id: string;
  user_id: string;
  title: string;
  category: InquiryCategory;
  status: InquiryStatus;
  priority: InquiryPriority;
  description: string;
  last_updated_at: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  messages?: UserInquiryMessage[];
  user?: {
    id: string;
    email: string;
    profile?: {
      full_name: string;
      avatar_url?: string;
    };
  };
}

export interface UserInquiryFilter {
  status?: InquiryStatus;
  category?: InquiryCategory;
  startDate?: string;
  endDate?: string;
  searchQuery?: string;
  isRead?: boolean;
}

export interface UserInquiryCreateData {
  title: string;
  category: InquiryCategory;
  description: string;
  attachment_urls?: string[];
}
