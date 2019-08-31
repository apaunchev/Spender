import { endOfMonth, isWithinInterval, startOfMonth } from "date-fns";
import { A } from "hookrouter";
import React, { useEffect, useState } from "react";
import Blankslate from "../../components/blankslate";
import Footer from "../../components/footer";
import Header from "../../components/header";
import MonthNav from "../../components/month-nav";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  compareBy,
  formatAmountInCurrency,
  formatAmountInPercent,
  getTotalAmountFromArray,
  groupBy,
  sumOfObjectValues
} from "../../utils";

const Expenses = ({ budgetId }) => {
  // Local storage
  const [expenses] = useLocalStorage("expenses", []);
  const [budgets] = useLocalStorage("budgets", []);
  const [settings] = useLocalStorage("settings", []);
  const currency = settings.currency || "EUR";

  // State
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [formattedExpenses, setFormattedExpenses] = useState(expenses);

  // Effects
  useEffect(() => {
    setFormattedExpenses(
      expenses
        .filter(e =>
          isWithinInterval(new Date(e.date), {
            start: startOfMonth(new Date(currentDate)),
            end: endOfMonth(new Date(currentDate))
          })
        )
        .filter(e => (budgetId ? e.budget === budgetId : true))
        .sort(compareBy("date", true))
    );

    setLoading(false);
  }, [budgetId, expenses, currentDate]);

  // Events
  const onSort = (e, field, desc) => {
    e.preventDefault();

    setFormattedExpenses([...formattedExpenses].sort(compareBy(field, desc)));
  };

  // Helpers
  const renderBar = (expenses, budgets, limit = 5) => {
    const groupedByBudget = groupBy(expenses, "budget");
    const budgetsWithAmounts = Object.keys(groupedByBudget)
      .map(budgetId => {
        const { id, name, color } = budgets.find(b => b.id === budgetId) || {};
        return {
          id,
          name,
          color,
          amount: sumOfObjectValues(groupedByBudget[budgetId], "amount")
        };
      })
      .sort(compareBy("amount", true));
    const budgetsWithAmountsAndOthers = [
      ...budgetsWithAmounts.slice(0, limit),
      {
        id: "_others",
        name: "Others",
        color: "#323232",
        amount: getTotalAmountFromArray(budgetsWithAmounts.slice(limit))
      }
    ];

    if (getTotalAmountFromArray(budgetsWithAmountsAndOthers) === 0) {
      return null;
    }

    return (
      <div className="bar">
        {Object.keys(budgetsWithAmountsAndOthers).map(budgetId => {
          const { id, name, color, amount } = budgetsWithAmountsAndOthers[
            budgetId
          ];
          const percentOfExpenses = formatAmountInPercent(
            (amount / getTotalAmountFromArray(expenses)) * 100
          );

          return (
            <div
              key={id}
              className="bar__segment"
              style={{
                backgroundColor: color,
                width: percentOfExpenses
              }}
              title={`${name} (${percentOfExpenses})`}
            >
              <span className="bar__segment__title">
                {name} ({percentOfExpenses})
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const getBudgetName = budgetId =>
    (budgets.find(b => b.id === budgetId) || {}).name;

  return (
    <>
      <Header />
      <main>
        <header className="mb3 flex flex--between">
          <div>
            <h1 className="mb0">Expenses</h1>
            <A href="/new/expense">New expense</A>
          </div>
          <MonthNav currentDate={currentDate} setCurrentDate={setCurrentDate} />
        </header>
        {!loading && formattedExpenses.length ? (
          <>
            {budgetId ? (
              <p className="italic">
                Showing expenses from the{" "}
                <strong>{getBudgetName(budgetId)}</strong> budget.{" "}
                <A href="/expenses" title="Clear filter">
                  ×
                </A>
              </p>
            ) : null}
            {renderBar(formattedExpenses, budgets)}
            <table className="table">
              <thead>
                <tr>
                  <th>
                    <a href="/dashboard" onClick={e => onSort(e, "date", true)}>
                      Date
                    </a>
                  </th>
                  <th>
                    <a href="/dashboard" onClick={e => onSort(e, "budget")}>
                      Budget
                    </a>
                  </th>
                  <th>
                    <a href="/dashboard" onClick={e => onSort(e, "payee")}>
                      Payee
                    </a>
                  </th>
                  <th className="tar">
                    <a
                      href="/dashboard"
                      onClick={e => onSort(e, "amount", true)}
                    >
                      Amount
                    </a>
                  </th>
                </tr>
              </thead>
              <tbody>
                {formattedExpenses.map(
                  ({ id, date, amount, budget, payee }) => {
                    const b = budgets.find(b => b.id === budget) || {};

                    return (
                      <tr key={id}>
                        <td data-label="Date">
                          <A href={`/expense/${id}`}>
                            {new Date(date).toLocaleDateString()}
                          </A>
                        </td>
                        <td data-label="Budget">
                          <span
                            className="color-pill"
                            style={{
                              backgroundColor: b.color || "#212121"
                            }}
                          />
                          <A href={`/expenses/${b.id}`}>{b.name}</A>
                        </td>
                        <td data-label="Payee">{payee || "–"}</td>
                        <td data-label="Amount" className="tar">
                          {formatAmountInCurrency(amount, currency)}
                        </td>
                      </tr>
                    );
                  }
                )}
              </tbody>
              <tfoot>
                <tr>
                  <th colSpan="3" className="tar">
                    Total
                  </th>
                  <td data-label="Total" className="tar bold">
                    {formatAmountInCurrency(
                      getTotalAmountFromArray(formattedExpenses),
                      currency
                    )}
                  </td>
                </tr>
              </tfoot>
            </table>
          </>
        ) : (
          <Blankslate
            title="Nothing to show"
            description="Looks like there are no expenses to show here yet."
          />
        )}
      </main>
      <Footer />
    </>
  );
};

export default Expenses;
