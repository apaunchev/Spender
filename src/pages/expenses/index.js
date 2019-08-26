import {
  addMonths,
  endOfMonth,
  format,
  isWithinInterval,
  startOfMonth,
  subMonths
} from "date-fns";
import { A } from "hookrouter";
import React, { useEffect, useState } from "react";
import Blankslate from "../../components/blankslate";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  compareBy,
  formatAmountInCurrency,
  formatAmountInPercent,
  getTotalAmountFromArray,
  groupBy,
  sumOfObjectValues
} from "../../utils";

const Expenses = () => {
  // Local storage
  const [expenses] = useLocalStorage("expenses", []);
  const [budgets] = useLocalStorage("budgets", []);

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
        .sort(compareBy("date", true))
    );

    setLoading(false);
  }, [expenses, currentDate]);

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

  return (
    <>
      <Header />
      <main>
        <div>
          <header className="mb3 flex flex--between">
            <div>
              <h2 className="mb0">Expenses</h2>
              <A href="/new/expense">New expense</A>
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
          {renderBar(formattedExpenses, budgets)}
          {!loading && formattedExpenses.length ? (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <a
                        href="/dashboard"
                        onClick={e => onSort(e, "date", true)}
                      >
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
                          <td>
                            <A href={`/expense/${id}`}>
                              {new Date(date).toLocaleDateString()}
                            </A>
                          </td>
                          <td>
                            <span
                              className="color-pill"
                              style={{
                                backgroundColor: b.color || "#212121"
                              }}
                            />
                            {b.name}
                          </td>
                          <td>{payee}</td>
                          <td className="tar mono">
                            {formatAmountInCurrency(amount)}
                          </td>
                        </tr>
                      );
                    }
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <Blankslate
              title="Nothing found"
              description="Looks like there are no expenses to show here yet."
            />
          )}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Expenses;
