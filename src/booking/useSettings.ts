import { useEffect, useState } from "react";
import { getSettings } from "./api";
import type { BookingSettings } from "./data";

/** Loads the UNILAG booking settings; `error` is set when the booking API is down. */
export function useSettings() {
  const [settings, setSettings] = useState<BookingSettings | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getSettings()
      .then(setSettings)
      .catch((e: Error) => setError(e.message));
  }, []);

  return { settings, error };
}
