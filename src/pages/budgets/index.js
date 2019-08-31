import {
  endOfMonth,
  getMonth,
  getYear,
  isWithinInterval,
  startOfMonth
} from "date-fns";
import { A } from "hookrouter";
import React, { useEffect, useState } from "react";
import Bar from "../../components/bar";
import Blankslate from "../../components/blankslate";
import Footer from "../../components/footer";
import Header from "../../components/header";
import MonthNav from "../../components/month-nav";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  compareBy,
  formatAmountInCurrency,
  formatAmountInPercent,
  getTotalAmountFromArray
} from "../../utils";

const Dashboard = () => {
  // Local storage
  const [expenses] = useLocalStorage("expenses", []);
  const [budgets] = useLocalStorage("budgets", []);
  const [settings] = useLocalStorage("settings", []);
  const currency = settings.currency || "EUR";

  // State
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formattedBudgets, setFormattedBudgets] = useState(budgets);
  const [formattedExpenses, setFormattedExpenses] = useState(expenses);

  // Effects
  useEffect(() => {
    setFormattedBudgets(
      budgets.filter(b =>
        isWithinInterval(new Date(b.date), {
          start: startOfMonth(new Date(currentDate)),
          end: endOfMonth(new Date(currentDate))
        })
      )
    );

    setFormattedExpenses(
      expenses.filter(e =>
        isWithinInterval(new Date(e.date), {
          start: startOfMonth(new Date(currentDate)),
          end: endOfMonth(new Date(currentDate))
        })
      )
    );

    setLoading(false);
  }, [budgets, expenses, currentDate]);

  // Events
  const onSort = (e, field, desc) => {
    e.preventDefault();

    setFormattedBudgets([...formattedBudgets].sort(compareBy(field, desc)));
  };

  // Helpers
  const getMTDForBudget = budgetId => {
    const expensesForBudget =
      formattedExpenses.filter(e => e.budget === budgetId) || [];

    if (!expensesForBudget.length) {
      return 0;
    }

    return getTotalAmountFromArray(expensesForBudget);
  };

  const totalPlanned = getTotalAmountFromArray(formattedBudgets);

  const totalCurrent = getTotalAmountFromArray(formattedExpenses);

  if (loading) {
    return null;
  }

  return (
    <>
      <Header />
      <main>
        <header className="mb3 flex flex--between">
          <div>
            <h1 className="mb0">Budgets</h1>
            <nav>
              <A
                href={`/new/budget/${getYear(currentDate)}/${getMonth(
                  currentDate
                )}`}
              >
                New budget
              </A>{" "}
              <A
                href={`/clone/${getYear(currentDate)}/${getMonth(currentDate)}`}
              >
                Clone budgets
              </A>
            </nav>
          </div>
          <MonthNav currentDate={currentDate} setCurrentDate={setCurrentDate} />
        </header>
        {formattedBudgets.length ? (
          <>
            <Bar data={formattedBudgets} />
            <table className="table">
              <thead>
                <tr>
                  <th width="100%">
                    <a href="/dashboard" onClick={e => onSort(e, "name")}>
                      Name
                    </a>
                  </th>
                  <th className="tar">
                    <a
                      href="/dashboard"
                      onClick={e => onSort(e, "amount", true)}
                    >
                      Planned
                    </a>
                  </th>
                  <th className="tar">Current</th>
                </tr>
              </thead>
              <tbody>
                {formattedBudgets.map(({ id, name, amount, color }) => {
                  const currentForBudget = getMTDForBudget(id);
                  const currentAsPercent = formatAmountInPercent(
                    (currentForBudget / amount) * 100,
                    0
                  );
                  let warningOrDangerClass = "";
                  if (currentForBudget > amount * 0.7) {
                    warningOrDangerClass = "warning";
                  }
                  if (currentForBudget >= amount) {
                    warningOrDangerClass = "danger";
                  }

                  return (
                    <tr key={id}>
                      <td data-label="Name">
                        <span
                          className="color-pill"
                          style={{ backgroundColor: color }}
                        />
                        <A href={`/budget/${id}`}>{name}</A>
                      </td>
                      <td data-label="Amount" className="tar">
                        {formatAmountInCurrency(amount, currency)}
                      </td>
                      <td
                        data-label="Current"
                        className={`tar ${warningOrDangerClass}`}
                        title={`${currentAsPercent} of budget`}
                      >
                        {formatAmountInCurrency(currentForBudget, currency)}{" "}
                        <small className="small-screen-only">
                          ({currentAsPercent})
                        </small>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th className="tar">Total</th>
                  <td data-label="Total planned" className="tar bold">
                    {formatAmountInCurrency(totalPlanned, currency)}
                  </td>
                  <td
                    data-label="Total current"
                    className={`tar bold ${
                      totalCurrent > totalPlanned ? "danger" : ""
                    }`}
                  >
                    {formatAmountInCurrency(totalCurrent, currency)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </>
        ) : (
          <Blankslate
            title="Nothing to show"
            description="Looks like there are no categories to show here yet."
          />
        )}
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
