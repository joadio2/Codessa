import React from "react";
import BriefingForm from "./briefingForm";
import SelectPlanPage from "../selectPlan/selectPlan";
import style from "./ProcessPage.module.css";
export default function ProcessPage({ basePath }) {
  const [plan, setPlan] = React.useState("");
  React.useEffect(() => {
    const savedPlan = sessionStorage.getItem("planElegido");
    if (savedPlan) {
      setPlan(savedPlan);
    }
  }, []);

  return (
    <main className={style.main}>
      {plan ? (
        <BriefingForm basePath={basePath} />
      ) : (
        <SelectPlanPage
          basePath={basePath}
          onChangePlan={(value) => setPlan(value)}
        />
      )}
    </main>
  );
}
