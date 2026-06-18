"use client";

import { useEffect } from "react";
import toast from "react-hot-toast";

export function BackendWarmUp() {
  useEffect(() => {
    let toastId: string | number | undefined;

    const warmup = async () => {
      toastId = toast.loading(
        "Starting backend server... This may take a few seconds."
      );

      try {
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/health`,
          {
            cache: "no-store",
          }
        );

        toast.success("Backend is ready", {
          id: toastId,
        });
      } catch {
        toast.error("Unable to reach backend", {
          id: toastId,
        });
      }
    };

    warmup();
  }, []);

  return null;
}