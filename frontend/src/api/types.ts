export type LocalizedNames = {
  ko: string;
  en: string;
};

export type Locale = keyof LocalizedNames;

export type ReservationStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CANCELLED";

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
};

export type UserResponse = {
  id: string;
  name: string;
  phone: string;
  created_at: string;
};

export type BuildingResponse = {
  id: string;
  names: LocalizedNames;
  created_at: string;
};

export type SpaceResponse = {
  id: string;
  building_id: string;
  names: LocalizedNames;
  floor: number;
  created_at: string;
};

export type ReservationPublicResponse = {
  status: ReservationStatus;
  start_at: string;
  end_at: string;
  user_name: string;
  memo?: string | null;
};

export type ReservationResponse = {
  id: string;
  user_id: string;
  space_id: string;
  status: ReservationStatus;
  start_at: string;
  end_at: string;
  created_at: string;
  updated_at: string;
  memo?: string | null;
};

export type HealthResponse = {
  status: "ok";
};

export type ApiErrorDetail = {
  detail: string | { msg: string }[];
};
