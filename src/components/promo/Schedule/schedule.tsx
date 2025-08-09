import { useState, useMemo, useEffect } from "react";
import Calendar from "react-calendar";
import { translationsScheduler } from "./translate";
type ValuePiece = Date | null;
type CalendarValue = ValuePiece | [ValuePiece, ValuePiece];

interface TimeSlot {
  spainTime: string;
  clientTime: string;
  isoDate: string;
}

const MY_TIME_ZONE = "Europe/Madrid";
const MY_AVAILABLE_HOURS = [9, 10, 11, 12, 16, 17, 18, 19];

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = Domingo, 6 = Sábado
};

// --- NUEVA FUNCIÓN HELPER: La clave de la solución ---
// Calcula la diferencia en horas entre una zona horaria y UTC para una fecha específica.
const getOffsetInHours = (timeZone: string, date: Date): number => {
  // Formatea la misma fecha en UTC y en la zona horaria deseada.
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone }));
  // La diferencia en milisegundos, convertida a horas, es el offset.
  return (tzDate.getTime() - utcDate.getTime()) / (3600 * 1000);
};

// --- FUNCIÓN getAvailableTimeSlots (COMPLETAMENTE REESCRITA) ---
const getAvailableTimeSlots = (date: Date): TimeSlot[] => {
  const clientTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const slots: TimeSlot[] = [];
  const now = new Date();

  // 1. Calcular la diferencia horaria entre España y el cliente.
  const spainOffset = getOffsetInHours(MY_TIME_ZONE, date); // Ej: 2 (para Madrid en verano)
  const clientOffset = getOffsetInHours(clientTimeZone, date); // Ej: 1 (para Lisboa en verano)
  const offsetDifference = spainOffset - clientOffset; // Ej: 2 - 1 = 1

  MY_AVAILABLE_HOURS.forEach((hourInSpain) => {
    // 2. Crear un objeto Date para el día seleccionado en la zona local del cliente.
    const slotDate = new Date(date);

    // 3. Ajustar la hora. Partimos de la hora de España y le restamos la diferencia de offsets.
    //    Ej: Para las 9:00 de España, en Lisboa será 9 - 1 = 8:00.
    //    Esto crea un objeto Date que representa el momento correcto.
    slotDate.setHours(hourInSpain - offsetDifference, 0, 0, 0);

    // 4. Filtrar los horarios que ya han pasado en el día actual.
    if (slotDate.getTime() < now.getTime()) {
      return;
    }

    // 5. Formatear para mostrar. Esta parte ahora funciona perfectamente
    //    porque `slotDate` es el objeto correcto.
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

// --- Componente Principal (sin cambios en su estructura) ---
export default function Scheduler({ basePath }: { basePath: string }) {
  const lang = basePath.split("/")[1];
  const t = translationsScheduler[lang];
  const [selectedDate, setSelectedDate] = useState<CalendarValue>(new Date());
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [isPaid, setIsPaid] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState<string | null>(null);

  useEffect(() => {
    const storedPlan = sessionStorage.getItem("planElegido");
    setPlan(storedPlan || "mensual");
  }, []);

  const priceDetails = useMemo(() => {
    if (plan === "anual") {
      return {
        planName: "Anual",
        displayPrice: "$50.00 USD",
        billingCycle: "/mes",
        note: "Facturado como $600.00 al año",
      };
    }
    return {
      planName: "Mensual",
      displayPrice: "$99.00 USD",
      billingCycle: "/mes",
      note: "Pago flexible, cancela cuando quieras",
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

  const handlePayment = () => {
    if (!selectedSlot) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsPaid(true);
    }, 2000);
  };

  if (isPaid) {
    return (
      <div className="confirmation-view">
        <div className="confirmation-icon">✅</div>
        <h2>¡Cita y Pago Confirmados!</h2>
        <p>
          Has agendado tu consulta para el
          <strong>
            {" "}
            {selectedDate instanceof Date &&
              selectedDate.toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
          </strong>
          .
        </p>
        <p>
          La hora de la cita es a las{" "}
          <strong>{selectedSlot?.spainTime} (Hora de España)</strong> /
          <strong> {selectedSlot?.clientTime} (Tu Hora Local)</strong>.
        </p>
        <p>
          Recibirás un email con el enlace de la videollamada y todos los
          detalles. ¡Nos vemos pronto!
        </p>
      </div>
    );
  }

  return (
    <div className="scheduler-layout">
      <div className="calendar-column">
        <h2>1. Selecciona un Día y Hora</h2>
        <div className="calendar-container">
          <Calendar
            onChange={handleDateChange}
            value={selectedDate}
            minDate={new Date()}
            locale="es-ES"
            tileDisabled={({ date, view }) =>
              view === "month" && isWeekend(date)
            }
          />
        </div>
        {selectedDate && (
          <div className="time-slots-container">
            <div className="time-slots-header">
              <h3>Horarios Disponibles</h3>
              <span className="timezone-info">Horarios en tu zona horaria</span>
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
                <p>No hay horarios disponibles para este día.</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className={`payment-column ${!selectedSlot ? "disabled" : ""}`}>
        <h2>2. Confirma y Paga</h2>
        <div className="summary-card">
          <h3>Resumen de la Consulta</h3>
          <div className="summary-item">
            <span>Fecha:</span>
            <span>
              {selectedDate instanceof Date
                ? selectedDate.toLocaleDateString("es-ES", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : "Selecciona un día"}
            </span>
          </div>
          <div className="summary-item">
            <span>Hora:</span>
            <span>{selectedSlot?.clientTime || "Selecciona un horario"}</span>
          </div>

          <div className="summary-item">
            <span>Plan:</span>
            <span className={`plan-badge plan-badge--${plan}`}>
              {priceDetails.planName}
            </span>
          </div>
          <div className="summary-item price">
            <span>Precio:</span>
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
          {isLoading ? "Procesando..." : "Pagar y Confirmar Cita"}
        </button>
        <div className="payment-info">
          🔒 Pago seguro a través de nuestro proveedor.
        </div>
      </div>
    </div>
  );
}
