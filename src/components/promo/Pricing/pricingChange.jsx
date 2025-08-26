import { useState, useEffect } from "react";
import Lottie from "lottie-react";
import RocketLaunch from "../../../assets/lottie/RocketLaunch.json";
import styles from "./PrincingChange.module.css";
import { translations } from "./translate";
export default function PricingChange({ basePath }) {
  const lang = basePath.split("/")[1];
  const t = translations[lang];
  const [plan, setPlan] = useState("anual");
  const newProjectUrl = `${basePath}/newProject`;

  useEffect(() => {
    const savedPlan = sessionStorage.getItem("planElegido");
    if (savedPlan) {
      setPlan(savedPlan);
    }
  }, []);

  const handleStartProject = () => {
    let newLink = "";
    if (lang === "es") newLink = `/${lang}/proyecto-web`;
    else if (lang === "pt") newLink = `/${lang}/projeto-web`;
    else newLink = `/${lang}/project-details`;
    sessionStorage.setItem("planElegido", plan);
    window.location.href = newLink;
  };

  return (
    <section id="prices" className={styles.section}>
      <h2 className={styles.title}>{t.pricing.title}</h2>
      <p className={styles.subtitle}>{t.pricing.subtitle}</p>

      <div className={styles.card}>
        <div className={styles.imageColumn}>
          <Lottie
            animationData={RocketLaunch}
            loop
            autoplay
            style={{ width: "100%", maxWidth: 400 }}
          />
        </div>

        <div className={styles.contentColumn}>
          <div className={styles.toggleWrapper}>
            <label
              className={`${styles.toggleLabel} ${
                plan === "anual" ? styles.active : ""
              }`}
            >
              <input
                type="radio"
                name="pricing"
                checked={plan === "anual"}
                onChange={() => setPlan("anual")}
              />
              {t.pricing.toggle.annual}
              <span className={styles.badge}>
                {t.pricing.toggle.annualBadge}
              </span>
            </label>
            <label
              className={`${styles.toggleLabel} ${
                plan === "mensual" ? styles.active : ""
              }`}
            >
              <input
                type="radio"
                name="pricing"
                checked={plan === "mensual"}
                onChange={() => setPlan("mensual")}
              />
              {t.pricing.toggle.monthly}
            </label>
          </div>

          <div className={styles.priceContent}>
            {plan === "anual" ? (
              <div className={styles.priceInfo}>
                <p className={styles.price}>
                  59<span className={styles.currency}>€</span>
                  <span className={styles.period}>{t.pricing.period}</span>
                </p>
                <p className={styles.note}>{t.pricing.annual.note}</p>
              </div>
            ) : (
              <div className={styles.priceInfo}>
                <p className={styles.price}>
                  109<span className={styles.currency}>€</span>
                  <span className={styles.period}>{t.pricing.period}</span>
                </p>
                <p className={styles.note}>{t.pricing.monthly.note}</p>
              </div>
            )}
          </div>

          <ul className={styles.features}>
            <li>✓ {t.pricing.features.item1}</li>
            <li>✓ {t.pricing.features.item2}</li>
            <li>✓ {t.pricing.features.item3}</li>
            <li>✓ {t.pricing.features.item4}</li>
            <li>✓ {t.pricing.features.item5}</li>
            <li>✓ {t.pricing.features.item6}</li>
            <li className={plan === "anual" ? "" : styles.desactivado}>
              {plan === "anual" ? "✓" : "✗"} {t.pricing.features.item7}
            </li>
            <li className={plan === "anual" ? "" : styles.desactivado}>
              {plan === "anual" ? "✓" : "✗"} {t.pricing.features.item8}
            </li>
            <li className={plan === "anual" ? "" : styles.desactivado}>
              {plan === "anual" ? "✓" : "✗"} {t.pricing.features.item9}
            </li>
            <li className={plan === "anual" ? "" : styles.desactivado}>
              {plan === "anual" ? "✓" : "✗"} {t.pricing.features.item10}
            </li>
          </ul>

          <button onClick={handleStartProject} className={styles.cta}>
            {t.pricing.cta}
          </button>
        </div>
      </div>
    </section>
  );
}
