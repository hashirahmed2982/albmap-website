import { apiFetch } from "./api";

export async function submitContactForm(data: {
  name: string;
  email: string;
  inquiryType: string;
  message: string;
}): Promise<{ delivered: boolean }> {
  return apiFetch<{ message: string; delivered: boolean }>("/contact", {
    method: "POST",
    body: data,
    skipAuth: true,
  });
}
