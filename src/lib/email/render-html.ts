import type { ReactElement } from "react";
import { render } from "react-email";

export async function renderHtml(react: ReactElement) {
  return render(react);
}

export async function renderText(react: ReactElement) {
  return render(react, { plainText: true });
}
