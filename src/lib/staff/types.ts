export type StaffRole =
  | "super_admin"
  | "admin"
  | "sales"
  | "warehouse"
  | "content_manager";

export type StaffActor = {
  profileId: string;
  email: string;
  fullName: string;
  phone: string | null;
  role: StaffRole;
};
