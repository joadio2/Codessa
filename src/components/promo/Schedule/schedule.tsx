import { useState, useMemo, useEffect } from "react";
import Calendar from "react-calendar";
import { translationsScheduler } from "./translate";
import {
  MY_AVAILABLE_HOURS,
  MY_TIME_ZONE,
  BOOKING_BUFFER_HOURS,
  isWeekend,
  getBookingCutoff,
  getOffsetInHours,
  getAvailableTimeSlots,
} from "./utils";
import type { TimeSlot } from "./utils";
import { loadStripe } from "@stripe/stripe-js";

type ValuePiece = Date | null;
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece];

const stripePromise = loadStripe(import.meta.env.PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function Scheduler({ basePath }: { basePath: string }) {
  const lang = basePath.split("/")[1];
  const t = translationsScheduler[lang];

  const [selectedDate, setSelectedDate] = useState<CalendarValue>(
    getBookingCutoff()
  );
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    const storedPlan = sessionStorage.getItem("planElegido");
    setPlan(storedPlan || "mensual");
  }, []);

  const priceDetails = useMemo(() => {
    if (plan === "anual") {
      return {
        planName: t.pricePlanAnnual,
        displayPrice: "50.00 €",
        billingCycle: t.billingCycleMonthly,
        note: t.priceNoteAnnual,
        amountCents: 60000,
      };
    }
    return {
      planName: t.pricePlanMonthly,
      displayPrice: "99.00 €",
      billingCycle: t.billingCycleMonthly,
      note: t.priceNoteMonthly,
      amountCents: 9900,
    };
  }, [plan]);

  const availableTimeSlots = useMemo(() => {
    if (selectedDate instanceof Date) {
      return getAvailableTimeSlots(selectedDate);
    }
    return [];
  }, [selectedDate]);

  const handleDateChange = (value: CalendarValue) => {
    setSelectedDate(value);
    setSelectedSlot(null);
  };

  const handleTimeSelect = (slot: TimeSlot) => {
    setSelectedSlot(slot);
  };

  const handlePayment = async () => {
    if (!selectedSlot) return;
    let order_id = "ORD-20250821-O2LNW3";
    const payload = {
      public_order_id: order_id,
      plan: plan,
      lang: lang,
    };
    console.log("payload:", payload);
    try {
      const res = await fetch(
        "http://127.0.0.1:54321/functions/v1/payment-received",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`, // <-- aquí
          },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        console.error(
          "Error create-checkout-session:",
          data?.error || res.statusText
        );
        // Muestra un toast o mensaje al usuario
        return;
      }

      if (!data?.url) {
        console.error("La respuesta no contiene url:", data);
        return;
      }

      window.location.href = data.url;
    } catch (err) {
      console.log("Network/Fetch error:", err);
      // Muestra un toast o mensaje al usuario
    }
  };

  const calendarMinDate = getBookingCutoff();

  return (
    <div className="scheduler-layout">
      {/* Calendario y selección de horarios */}
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
            <div className="time-slots-grid">
              {availableTimeSlots.length > 0 ? (
                availableTimeSlots.map((slot) => (
                  <button
                    key={slot.isoDate}
                    className={`time-slot-btn ${
                      selectedSlot?.isoDate === slot.isoDate ? "active" : ""
                    }`}
                    onClick={() => handleTimeSelect(slot)}
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

      {/* Resumen y botón de pago */}
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
          disabled={!selectedSlot || isLoading}
        >
          {isLoading ? t.payProcessing : t.payButton}
        </button>
        <div className="payment-info">{t.paymentInfo}</div>
      </div>
    </div>
  );
}
