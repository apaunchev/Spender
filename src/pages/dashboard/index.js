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
  const getBalanceAmount = (budgets, expenses) =>
    getTotalAmountFromArray(budgets) - getTotalAmountFromArray(expenses);

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

  if (loading) {
    return null;
  }

  return (
    <>
      <Header />
      <main>
        {renderBalanceMessage(
          getBalanceAmount(budgets, formattedExpenses),
          currency,
          budgets
        )}
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
              >
                &larr;
              </button>
              <button
                className="button"
                onClick={() => setCurrentDate(new Date())}
              >
                {format(currentDate, "MMM yyyy")}
              </button>
              <button
                className="button"
                onClick={() => setCurrentDate(addMonths(currentDate, 1))}
              >
                &rarr;
              </button>
            </nav>
          </header>
          <Bar data={budgets} />
          <div className="table-wrap">
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
                  const current = getMTDForBudget(id);

                  return (
                    <tr key={id}>
                      <td>
                        <span
                          className="color-pill"
                          style={{ backgroundColor: color }}
                        />
                        <A href={`/budget/${id}`}>{name}</A>
                      </td>
                      <td className="tar mono">
                        {formatAmountInCurrency(amount, currency)}
                      </td>
                      <td
                        className={`tar mono ${
                          current > amount ? "danger" : ""
                        }`}
                      >
                        {formatAmountInCurrency(current, currency)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <th>Total</th>
                  <td className="tar bold mono">
                    {formatAmountInCurrency(
                      getTotalAmountFromArray(budgets),
                      currency
                    )}
                  </td>
                  <td className="tar bold mono">
                    {formatAmountInCurrency(
                      getTotalAmountFromArray(formattedExpenses),
                      currency
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
