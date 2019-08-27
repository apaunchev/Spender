import {
  addMonths,
  format,
  isWithinInterval,
  startOfMonth,
  subMonths
} from "date-fns";
import { endOfMonth } from "date-fns/esm";
import { A } from "hookrouter";
import React, { useState, useEffect } from "react";
import Bar from "../../components/bar";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  formatAmountInCurrency,
  getTotalAmountFromArray,
  compareBy
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
    setFormattedExpenses(
      expenses.filter(e =>
        isWithinInterval(new Date(e.date), {
          start: startOfMonth(new Date(currentDate)),
          end: endOfMonth(new Date(currentDate))
        })
      )
    );

    setLoading(false);
  }, [expenses, currentDate]);

  // Events
  const onSort = (e, field, desc) => {
    e.preventDefault();

    setFormattedBudgets([...formattedBudgets].sort(compareBy(field, desc)));
  };

  // Helpers
  const renderBalanceMessage = (amount, currency, budgets) => {
    const RISK_THRESHOLD = 0.3;
    const formattedAmount = formatAmountInCurrency(amount, currency);
    const totalBudgets = getTotalAmountFromArray(budgets);

    let className;
    if (amount <= 0) {
      className = "balance balance--dangerous";
    } else if (amount > 0 && amount <= totalBudgets * RISK_THRESHOLD) {
      className = "balance balance--risky";
    } else {
      className = "balance balance--safe";
    }

    return (
      <div>
        <h1>
          You have <span className={className}>{formattedAmount}</span> to spend
          this month.{" "}
        </h1>
        <A href="/new/expense" className="button button--primary jumbo">
          New expense →
        </A>
      </div>
    );
  };

  const getMTDForBudget = budgetId => {
    const expensesForBudget =
      formattedExpenses.filter(e => e.budget === budgetId) || [];

    if (!expensesForBudget.length) {
      return 0;
    }

    return getTotalAmountFromArray(expensesForBudget);
  };

  const totalPlanned = getTotalAmountFromArray(budgets);

  const totalCurrent = getTotalAmountFromArray(formattedExpenses);

  if (loading) {
    return null;
  }

  return (
    <>
      <Header />
      <main>
        {renderBalanceMessage(totalPlanned - totalCurrent, currency, budgets)}
        <hr />
        <div>
          <header className="mb3 flex flex--between">
            <div>
              <h2 className="mb0">Budgets</h2>
              <A href="/new/budget">New budget</A>
            </div>
            <nav className="button-group">
              <button
                className="button"
                onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                title="Jump to previous month"
              >
                &larr;
              </button>
              <button
                className="button"
                onClick={() => setCurrentDate(new Date())}
                title="Jump to current month"
              >
                {format(currentDate, "MMM yyyy")}
              </button>
              <button
                className="button"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                title="Jump to next month"
              >
                &rarr;
              </button>
            </nav>
          </header>
          <Bar data={budgets} />
          <table className="table">
            <thead>
              <tr>
                <th width="100%">
                  <a href="/dashboard" onClick={e => onSort(e, "name")}>
                    Name
                  </a>
                </th>
                <th className="tar">
                  <a href="/dashboard" onClick={e => onSort(e, "amount", true)}>
                    Planned
                  </a>
                </th>
                <th className="tar">Current</th>
              </tr>
            </thead>
            <tbody>
              {formattedBudgets.map(({ id, name, amount, color }) => {
                const currentForBudget = getMTDForBudget(id);

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
                      className={`tar ${
                        currentForBudget > amount ? "danger" : ""
                      }`}
                    >
                      {formatAmountInCurrency(currentForBudget, currency)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr>
                <th>Total</th>
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
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
