import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import styles from "./BriefingForm.module.css";
import { translationsBriefing } from "./transalate";

const ServiceIcon = ({ type }) => {
  const icons = {
    cart: (
      <>
        <circle cx="9" cy="21" r="1"></circle>
        <circle cx="20" cy="21" r="1"></circle>
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
      </>
    ),
    automation: (
      <>
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
        <path d="m9.09 9.09.41 5.83 5.41-1.41"></path>
      </>
    ),
    cms: (
      <>
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
        <polyline points="14 2 14 8 20 8"></polyline>
        <line x1="16" y1="13" x2="8" y2="13"></line>
        <line x1="16" y1="17" x2="8" y2="17"></line>
        <polyline points="10 9 9 9 8 9"></polyline>
      </>
    ),
    customApp: (
      <>
        <polyline points="16 18 22 12 16 6"></polyline>
        <polyline points="8 6 2 12 8 18"></polyline>
      </>
    ),
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {icons[type]}
    </svg>
  );
};

const supabaseUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function BriefingForm({ basePath }) {
  const lang = basePath.split("/")[1];
  const t = translationsBriefing[lang] || translationsBriefing["es"];
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    nombre_negocio: "",
    descripcion: "",
    estilo_elegido: "",
    colores: "",
    referencias: "",
    email_contacto: "",
    terminos: false,
    comunicaciones: false,
    plan: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  useEffect(() => {
    const savedPlan = sessionStorage.getItem("planElegido");
    if (savedPlan) {
      setFormData((prevFormData) => ({
        ...prevFormData,
        plan: savedPlan,
      }));
    }
  }, []);

  const goPayment = () => {
    let newLink = "";
    if (lang === "es") newLink = `/${lang}/proyecto-web/pago`;
    else if (lang === "pt") newLink = `/${lang}/projeto-web/pagamento`;
    else newLink = `/${lang}/project-details/payment`;
    window.location.href = newLink;
  };

  const stepsConfig = [
    { requiredFields: ["nombre_negocio"] },
    { requiredFields: [] },
    { requiredFields: ["email_contacto", "terminos"] },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? checked : type === "file" ? files[0] : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateCurrentStep = () => {
    const currentRequiredFields = stepsConfig[currentStep].requiredFields;
    let newErrors = {};
    let isValid = true;

    currentRequiredFields.forEach((field) => {
      if (!formData[field]) {
        isValid = false;
        newErrors[field] = "Este campo es obligatorio.";
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleNext = () => {
    if (validateCurrentStep()) {
      if (currentStep < stepsConfig.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateCurrentStep()) return;

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const payload = { ...formData };
      const res = await fetch("http://127.0.0.1:54321/functions/v1/pre-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0`, // <-- aquí
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        console.error("Function error:", res.status, err);
        throw new Error("Function call failed");
      }
      const data = await res.json();
      localStorage.setItem("public_order_id", data.public_code);

      goPayment();
    } catch (error) {
      const errorMessage = t.errors.submit;
      setSubmitError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const progressSteps = [...t.progressSteps];

  return (
    <main className={styles.briefingContainer}>
      <div className={styles.layoutWrapper}>
        <div className={styles.browserWindowForm}>
          <header className={styles.browserHeader}>
            <div className={styles.browserButtons}>
              <div className={`${styles.button} ${styles.red}`}></div>
              <div className={`${styles.button} ${styles.yellow}`}></div>
              <div className={`${styles.button} ${styles.green}`}></div>
            </div>
            <div className={styles.browserTitle}>{t.browserTitle}</div>
          </header>

          <div className={styles.formContent}>
            <div className={styles.formHeaderText}>
              <h1>{t.formHeader.title}</h1>
              <p>{t.formHeader.desc}</p>
            </div>

            <div className={styles.progressBar}>
              {progressSteps.map((label, index) => (
                <React.Fragment key={index}>
                  <div className={styles.stepWrapper}>
                    <div
                      className={`${styles.stepIcon} ${
                        index < currentStep ? styles.completed : ""
                      } ${index === currentStep ? styles.current : ""}`}
                    >
                      {index + 1}
                    </div>
                    <span className={styles.stepLabel}>{label}</span>
                  </div>
                  {index < progressSteps.length - 1 && (
                    <div className={styles.progressLine}></div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <form onSubmit={handleSubmit} noValidate>
              {currentStep === 0 && (
                <div className={`${styles.formStep} ${styles.active}`}>
                  <div className={styles.formGroup}>
                    <label htmlFor="nombre_negocio">
                      {t.step1.nombre_negocio}
                    </label>
                    <input
                      type="text"
                      id="nombre_negocio"
                      name="nombre_negocio"
                      value={formData.nombre_negocio}
                      onChange={handleChange}
                      placeholder={t.step1.nombre_placeholder}
                      required
                      className={errors.nombre_negocio ? styles.inputError : ""}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="descripcion">{t.step1.descripcion}</label>
                    <textarea
                      id="descripcion"
                      name="descripcion"
                      rows="4"
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder={t.step1.descripcion_placeholder}
                    ></textarea>
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className={`${styles.formStep} ${styles.active}`}>
                  <div className={styles.formGroup}>
                    <label>{t.step2.estilo_label}</label>
                    <div className={styles.stylePicker}>
                      {t.step2.estilos.map((style) => (
                        <label
                          key={style.value}
                          className={styles.styleCardPicker}
                        >
                          <input
                            type="radio"
                            className={styles.hiddenRadio}
                            name="estilo_elegido"
                            value={style.value}
                            checked={formData.estilo_elegido === style.value}
                            onChange={handleChange}
                          />
                          <span
                            className={styles.radioMark}
                            aria-hidden="true"
                          ></span>
                          <div className={styles.cardContentPicker}>
                            <h3>{style.title}</h3>
                            <p>{style.desc}</p>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="colores">{t.step2.colores}</label>
                    <input
                      type="text"
                      id="colores"
                      name="colores"
                      value={formData.colores}
                      onChange={handleChange}
                      placeholder={t.step2.colores_placeholder}
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className={`${styles.formStep} ${styles.active}`}>
                  <div className={styles.formGroup}>
                    <label htmlFor="referencias">{t.step3.referencias}</label>
                    <input
                      type="url"
                      id="referencias"
                      name="referencias"
                      value={formData.referencias}
                      onChange={handleChange}
                      placeholder="https://ejemplo.com"
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="email_contacto">{t.step3.email}</label>
                    <input
                      type="email"
                      id="email_contacto"
                      name="email_contacto"
                      value={formData.email_contacto}
                      onChange={handleChange}
                      placeholder={t.step3.email_placeholder}
                      required
                      className={errors.email_contacto ? styles.inputError : ""}
                    />
                  </div>
                  <div
                    className={`${styles.formGroup} ${
                      styles.formGroupCheckbox
                    } ${errors.terminos ? styles.inputError : ""}`}
                  >
                    <input
                      type="checkbox"
                      id="terminos"
                      name="terminos"
                      checked={formData.terminos}
                      onChange={handleChange}
                      required
                    />
                    <label htmlFor="terminos">
                      {t.step3.terminos}
                      <a
                        href="/terminos-y-condiciones"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {t.step3.terminos_link}
                      </a>
                      {t.step3.terminos_end}
                    </label>
                  </div>
                  <div
                    className={`${styles.formGroup} ${styles.formGroupCheckbox}`}
                  >
                    <input
                      type="checkbox"
                      id="comunicaciones"
                      name="comunicaciones"
                      checked={formData.comunicaciones}
                      onChange={handleChange}
                    />
                    <label htmlFor="comunicaciones">
                      {t.step3.comunicaciones}
                    </label>
                  </div>
                </div>
              )}
              {submitError && (
                <p className={styles.submitError}>{submitError}</p>
              )}
              <div className={styles.formNavigation}>
                <button
                  type="button"
                  onClick={handlePrev}
                  style={{
                    display: currentStep === 0 ? "none" : "inline-block",
                  }}
                  className={styles.prevBtn}
                >
                  {t.nav.atras}
                </button>
                {currentStep < stepsConfig.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className={`${styles.ctaButton} ${styles.nextBtn}`}
                  >
                    {t.nav.siguiente}
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`${styles.ctaButton} ${styles.nextBtn}`}
                  >
                    {isSubmitting ? `${t.nav.enviando}...` : `${t.nav.enviar}`}
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <aside className={styles.advancedServicesPanel}>
          <div className={styles.panelHeader}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
            <h2>{t.advanced.title}</h2>
          </div>
          <p className={styles.panelIntro}>{t.advanced.subtitle}</p>
          <div className={styles.servicesGrid}>
            <div className={styles.serviceCard}>
              <div className={styles.cardIcon}>
                <ServiceIcon type="cart" />
              </div>
              <div className={styles.cardText}>
                <h3>{t.advanced.services[0].title}</h3>
                <p>{t.advanced.services[0].description}</p>
              </div>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.cardIcon}>
                <ServiceIcon type="automation" />
              </div>
              <div className={styles.cardText}>
                <h3>{t.advanced.services[1].title}</h3>
                <p>{t.advanced.services[1].description}</p>
              </div>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.cardIcon}>
                <ServiceIcon type="cms" />
              </div>
              <div className={styles.cardText}>
                <h3>{t.advanced.services[2].title}</h3>
                <p>{t.advanced.services[2].description}</p>
              </div>
            </div>
            <div className={styles.serviceCard}>
              <div className={styles.cardIcon}>
                <ServiceIcon type="customApp" />
              </div>
              <div className={styles.cardText}>
                <h3>{t.advanced.services[3].title}</h3>
                <p>{t.advanced.services[3].description}</p>
              </div>
            </div>
          </div>
          <a
            href={`/${lang}/contact`}
            className={`${styles.ctaButton} ${styles.secondary}`}
          >
            {t.advanced.cta}
          </a>
        </aside>
      </div>
    </main>
  );
}
