"use client";
import { toast } from "sonner";

export function toastAnnouncement(type: "success" | "error", message: string) {
  toast[type](message, {
    duration: 3500,
    position: "top-center",
  });
}
