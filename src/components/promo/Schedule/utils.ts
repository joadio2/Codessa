export interface TimeSlot {
  spainTime: string;
  clientTime: string;
  isoDate: string;
}

export const MY_TIME_ZONE = "Europe/Madrid";
export const MY_AVAILABLE_HOURS = [9, 10, 11, 12, 16, 17, 18, 19];
export const BOOKING_BUFFER_HOURS = 48;

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const getBookingCutoff = (): Date => {
  return new Date(Date.now() + BOOKING_BUFFER_HOURS * 60 * 60 * 1000);
};

export const getOffsetInHours = (timeZone: string, date: Date): number => {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone }));
  return (tzDate.getTime() - utcDate.getTime()) / (3600 * 1000);
};

export const getAvailableTimeSlots = (date: Date): TimeSlot[] => {
  const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const slots: TimeSlot[] = [];
  const cutoff = getBookingCutoff(); // ahora + 48h

  const spainOffset = getOffsetInHours(MY_TIME_ZONE, date);
  const clientOffset = getOffsetInHours(clientTimeZone, date);
  const offsetDifference = spainOffset - clientOffset;

  MY_AVAILABLE_HOURS.forEach((hourInSpain) => {
    const slotDate = new Date(date);
    // Ajuste de horas de España -> zona del cliente
    slotDate.setHours(hourInSpain - offsetDifference, 0, 0, 0);

    // Filtrar cualquier horario antes del umbral de 48h
    if (slotDate.getTime() < cutoff.getTime()) {
      return;
    }

    const spainTimeFormatter = new Intl.DateTimeFormat("es-ES", {
      timeZone: MY_TIME_ZONE,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    const clientTimeFormatter = new Intl.DateTimeFormat("es-ES", {
      timeZone: clientTimeZone,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });

    slots.push({
      spainTime: spainTimeFormatter.format(slotDate),
      clientTime: clientTimeFormatter.format(slotDate),
      isoDate: slotDate.toISOString(),
    });
  });

  return slots;
};

function formatYmdInMadrid(date: Date) {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(date);
}

export const getBusySchedule = async (date: Date | string) => {
  const d = new Date(date);

  const dayStr = formatYmdInMadrid(d);

  const api = import.meta.env.PUBLIC_SUPABASE_URL;
  const token = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  const res = await fetch(`${api}/busy-schedule?date=${dayStr}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `HTTP ${res.status}`);
  }

  const data = await res.json();
  const busyTimes: string[] = Array.isArray(data?.busyTimes)
    ? data.busyTimes
    : [];

  const normalized = busyTimes
    .map((t) => {
      const [h, m] = String(t).split(":");
      if (h == null || m == null) return null;
      return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    })
    .filter(Boolean) as string[];
  return new Set(normalized);
};
