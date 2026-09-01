/** Only user-safe feedback crosses the Server Action boundary. */
export type CustomerAuthFormState = {
  status?: "error" | "success";
  message?: string;
  fieldErrors?: Record<string, string[]>;
};
