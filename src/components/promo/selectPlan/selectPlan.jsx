import { useState } from "react";
import styles from "./SelectPlan.module.css";
import { translations } from "./translations";
export default function SelectPlanPage({ basePath, onChangePlan }) {
  const [selectedPlan, setSelectedPlan] = useState("anual");
  const newProjectUrl = `${basePath}/newProject`;
  const lang = basePath.split("/")[1];
  const t = translations[lang];
  const handleSelectPlan = (plan) => {
    sessionStorage.setItem("planElegido", plan);
    onChangePlan(plan);
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h2>{t.header.title}</h2>
        <p>{t.header.subtitle}</p>
      </header>

      <main className={styles.pricingGrid}>
        {/* --- Tarjeta Plan Mensual --- */}
        <div className={styles.pricingCard}>
          <div className={styles.cardHeader}>
            <h3>{t.monthly.title}</h3>
          </div>
          <div className={styles.priceInfo}>
            <p className={styles.price}>
              109<span className={styles.currency}>€</span>
              <span className={styles.period}>{t.period}</span>
            </p>
            <p className={styles.note}>{t.monthly.note}</p>
          </div>
          <ul className={styles.features}>
            <li>{t.features.item1}</li>
            <li>{t.features.item2}</li>
            <li>{t.features.item3}</li>
            <li>{t.features.item4}</li>
            <li>{t.features.item5}</li>
            <li>{t.features.item6}</li>
            <li className={styles.desactivado}>{t.features.item7}</li>
            <li className={styles.desactivado}>{t.features.item8}</li>
            <li className={styles.desactivado}>{t.features.item9}</li>
            <li className={styles.desactivado}>{t.features.item10}</li>
          </ul>
          <button
            onClick={() => handleSelectPlan("mensual")}
            className={styles.cta}
          >
            {t.monthly.cta}
          </button>
        </div>

        {/* --- Tarjeta Plan Anual (Recomendado) --- */}
        <div className={`${styles.pricingCard} ${styles.recommended}`}>
          <div className={styles.cardHeader}>
            <h3>{t.annual.title}</h3>
            <span className={styles.badge}>{t.annual.badge}</span>
          </div>
          <div className={styles.priceInfo}>
            <p className={styles.price}>
              59<span className={styles.currency}>€</span>
              <span className={styles.period}>{t.period}</span>
            </p>
            <p className={styles.note}>
              {t.annual.note} <strong>{t.annual.savings}</strong>
            </p>
          </div>
          <ul className={styles.features}>
            <li>{t.features.item1}</li>
            <li>{t.features.item2}</li>
            <li>{t.features.item3}</li>
            <li>{t.features.item4}</li>
            <li>{t.features.item5}</li>
            <li>{t.features.item6}</li>
            <li>{t.features.item7}</li>
            <li>{t.features.item8}</li>
            <li>{t.features.item9}</li>
            <li>{t.features.item10}</li>
          </ul>
          <button
            onClick={() => handleSelectPlan("anual")}
            className={`${styles.cta} ${styles.ctaRecommended}`}
          >
            {t.annual.cta}
          </button>
        </div>
      </main>
    </div>
  );
}
