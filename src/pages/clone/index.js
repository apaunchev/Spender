import { format, parseISO } from "date-fns";
import { navigate } from "hookrouter";
import React, { useEffect, useState } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { ID } from "../../utils";
import { DATE_FORMAT_HUMAN, DATE_FORMAT_ISO } from "../../consts";

const Clone = ({ year, month }) => {
  // Local storage
  const [budgets, setBudgets] = useLocalStorage("budgets", []);

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cloneFromMonth, setCloneFromMonth] = useState("");

  // Effects
  useEffect(() => {
    if (year && month) {
      setCurrentDate(new Date(year, month, 1));
    }
  }, [year, month]);

  // Events
  const onSubmit = e => {
    e.preventDefault();

    const budgetsToClone = [...budgets]
      .filter(b => b.date === cloneFromMonth)
      .map(b => ({
        ...b,
        id: ID(),
        date: format(currentDate, DATE_FORMAT_ISO)
      }));

    if (
      budgetsToClone.length &&
      window.confirm(
        `We are about to clone ${budgetsToClone.length} budgets from ${format(
          parseISO(cloneFromMonth),
          DATE_FORMAT_HUMAN
        )} into ${format(
          currentDate,
          DATE_FORMAT_HUMAN
        )}. Do you want to proceed?`
      )
    ) {
      setBudgets([...budgets, ...budgetsToClone]);
      navigate("/dashboard");
    }
  };

  // Helpers
  const getAvailableMonthsFromBudgets = [...budgets]
    .map(b => parseISO(b.date))
    .filter(
      (date, i, self) =>
        self.findIndex(d => d.getTime() === date.getTime()) === i
    )
    .filter(d => d.getTime() !== currentDate.getTime())
    .sort((a, b) => (a.getTime() > b.getTime() ? -1 : 1));

  return (
    <>
      <Header />
      <main>
        <h1>Clone budgets</h1>
        <p>
          This operation will clone the budgets from the selected month into{" "}
          <strong>{format(currentDate, DATE_FORMAT_HUMAN)}</strong>.
        </p>
        <form className="form" onSubmit={onSubmit}>
          <div className="form-input">
            <label htmlFor="cloneFromMonth">Clone from</label>
            <select
              name="cloneFromMonth"
              id="cloneFromMonth"
              value={cloneFromMonth}
              onChange={e => setCloneFromMonth(e.target.value)}
              required
            >
              <option value="" disabled hidden>
                Select a month...
              </option>
              {getAvailableMonthsFromBudgets.map((m, idx) => (
                <option key={`month-${idx}`} value={format(m, DATE_FORMAT_ISO)}>
                  {format(m, DATE_FORMAT_HUMAN)}
                </option>
              ))}
            </select>
            {!getAvailableMonthsFromBudgets.length ? (
              <p className="danger mt2 mb0">
                There are no months available to clone from.
              </p>
            ) : null}
          </div>
          <div className="form-input">
            <input
              type="submit"
              className="button button--primary"
              value="Clone"
            />
          </div>
        </form>
      </main>
      <Footer />
    </>
  );
};

export default Clone;
