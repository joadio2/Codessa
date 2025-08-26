import { useState, useMemo, useEffect } from "react";
import Calendar from "react-calendar";
import { translationsScheduler } from "./translate";
import {
  isWeekend,
  getBookingCutoff,
  getAvailableTimeSlots,
  getBusySchedule, // Debe devolver Promise<Set<string>> con horas "HH:mm" en la TZ elegida
} from "./utils";
import type { TimeSlot } from "./utils";
import { loadStripe } from "@stripe/stripe-js";

type ValuePiece = Date | null;
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece];

const api_url = import.meta.env.PUBLIC_SUPABASE_URL;
const token = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

export default function Scheduler({ basePath }: { basePath: string }) {
  const lang = basePath.split("/")[1];
  const t = translationsScheduler[lang];

  const [selectedDate, setSelectedDate] = useState<CalendarValue>(
    getBookingCutoff()
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  // Estado para horarios ocupados del día (formato "HH:mm")
  const [busyTimeSet, setBusyTimeSet] = useState<Set<string>>(new Set());
  const [busyLoading, setBusyLoading] = useState(false);
  const [busyError, setBusyError] = useState<string | null>(null);

  useEffect(() => {
    const storedPlan = sessionStorage.getItem("planElegido");
    // const public_order_id = sessionStorage.getItem("public_order_id");
    setPlan(storedPlan || "mensual");
  }, []);

  // Detalles de precio (tal cual tu lógica original)
  const priceDetails = useMemo(() => {
    if (plan === "anual") {
      return {
        planName: t.pricePlanAnnual,
        displayPrice: "59.00 €",
        billingCycle: t.billingCycleMonthly,
        note: t.priceNoteAnnual,
        amountCents: 70800,
      };
    }
    return {
      planName: t.pricePlanMonthly,
      displayPrice: "109.00 €",
      billingCycle: t.billingCycleMonthly,
      note: t.priceNoteMonthly,
      amountCents: 10900,
    };
  }, [plan]);

  // Cargar horarios ocupados cuando cambia el día seleccionado
  useEffect(() => {
    if (!(selectedDate instanceof Date)) {
      setBusyTimeSet(new Set());
      return;
    }
    let cancelled = false;

    (async () => {
      try {
        setBusyLoading(true);
        setBusyError(null);

        // getBusySchedule debe devolver Set<"HH:mm"> en la TZ que uses para comparar
        const res = await getBusySchedule(selectedDate);
        if (!cancelled) setBusyTimeSet(res || new Set());
      } catch (e: any) {
        if (!cancelled) {
          setBusyError(e?.message || "Error al cargar disponibilidad");
          setBusyTimeSet(new Set());
        }
      } finally {
        if (!cancelled) setBusyLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  const baseAvailableTimeSlots = useMemo(() => {
    if (selectedDate instanceof Date) {
      return getAvailableTimeSlots(selectedDate);
    }
    return [];
  }, [selectedDate]);

  const availableTimeSlots = useMemo(() => {
    if (!baseAvailableTimeSlots.length) return [];
    if (!busyTimeSet.size) return baseAvailableTimeSlots;
    return baseAvailableTimeSlots.filter((s) => !busyTimeSet.has(s.spainTime));
  }, [baseAvailableTimeSlots, busyTimeSet]);

  const handleDateChange = (value: CalendarValue) => {
    setSelectedDate(value);
    setSelectedSlot(null);
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handlePayment = async () => {
    if (!selectedSlot) return;
    setIsLoading(true);
    try {
      const order_id = sessionStorage.getItem("public_order_id");
      const payload = {
        public_order_id: order_id,
        plan: plan,
        lang: lang,
        diaReunion: selectedSlot,
      };

      const res = await fetch(`${api_url}/payment-received`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        window.location.href = `/${lang}/problem`;
        return;
      }

      if (!data?.url) {
        console.error("La respuesta no contiene url:", data);
        window.location.href = `/${lang}/problem`;
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      window.location.href = `/${lang}/problem`;
    } finally {
      setIsLoading(false);
    }
  };

  const calendarMinDate = getBookingCutoff();

  return (
    <div className="scheduler-layout">
      <div className="calendar-column">
        <h2>{t.step1Title}</h2>
        <div className="calendar-container">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            minDate={calendarMinDate}
            locale={t.calendarLocale}
            prev2Label={null}
            next2Label={null}
            calendarType="gregory"
            showNeighboringMonth={false}
            formatShortWeekday={(locale, date) =>
              date
                .toLocaleDateString(locale, { weekday: "short" })
                .replace(".", "")
                .slice(0, 3)
            }
            formatMonthYear={(locale, date) =>
              date.toLocaleDateString(locale, {
                month: "short",
                year: "numeric",
              })
            }
            tileDisabled={({ date, view }) =>
              view === "month" && isWeekend(date)
            }
            tileClassName={({ date, view }) => {
              if (view !== "month") return undefined;
              const classes: string[] = [];
              if (isWeekend(date)) classes.push("rc-tile--weekend");

              const cutoff = getBookingCutoff();
              const endOfDay = new Date(date);
              endOfDay.setHours(23, 59, 59, 999);
              if (endOfDay.getTime() < cutoff.getTime()) {
                classes.push("rc-tile--locked");
              }

              const hasSlots = getAvailableTimeSlots(date).length > 0;
              if (hasSlots) classes.push("rc-tile--available");

              return classes.join(" ");
            }}
          />
        </div>

        {selectedDate && (
          <div className="time-slots-container">
            <div className="time-slots-header">
              <h3>{t.availableSlotsTitle}</h3>
            </div>

            {busyLoading && <p>{t.loading || "Cargando disponibilidad..."}</p>}
            {busyError && (
              <p className="error">
                {t.errorLoading || "Error al cargar disponibilidad"}
              </p>
            )}

            <div className="time-slots-grid">
              {availableTimeSlots.length > 0 ? (
                availableTimeSlots.map((slot) => (
                  <button
                    key={slot.isoDate}
                    className={`time-slot-btn ${
                      selectedSlot?.isoDate === slot.isoDate ? "active" : ""
                    }`}
                    onClick={() => handleTimeSelect(slot)}
                    disabled={busyLoading}
                  >
                    <span className="client-time">{slot.clientTime}</span>
                    <span className="spain-time">{slot.spainTime} CET</span>
                  </button>
                ))
              ) : (
                <p>{t.noSlots}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={`payment-column ${!selectedSlot ? "disabled" : ""}`}>
        <h2>{t.step2Title}</h2>
        <div className="summary-card">
          <h3>{t.summaryTitle}</h3>
          <div className="summary-item">
            <span>{t.summaryDate}</span>
            <span>
              {selectedDate instanceof Date
                ? selectedDate.toLocaleDateString(t.calendarLocale, {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })
                : t.summaryDate}
            </span>
          </div>
          <div className="summary-item">
            <span>{t.summaryTime}</span>
            <span>{selectedSlot?.clientTime || t.summaryTime}</span>
          </div>
          <div className="summary-item">
            <span>{t.summaryPlan}</span>
            <span className={`plan-badge plan-badge--${plan}`}>
              {priceDetails.planName}
            </span>
          </div>
          <div className="summary-item price">
            <span>{t.summaryPrice}</span>
            <div className="price-value-container">
              <div className="price-line">
                <span className="main-price">{priceDetails.displayPrice}</span>
                <span className="billing-cycle">
                  {priceDetails.billingCycle}
                </span>
              </div>
              <span className="price-note">{priceDetails.note}</span>
            </div>
          </div>
        </div>
        <button
          className="cta-button payment-btn"
          onClick={handlePayment}
          disabled={!selectedSlot || isLoading || busyLoading}
        >
          {isLoading ? t.payProcessing : t.payButton}
        </button>
        <div className="payment-info">{t.paymentInfo}</div>
      </div>
    </div>
  );
}
