import {
  endOfMonth,
  getMonth,
  getYear,
  isWithinInterval,
  startOfMonth
} from "date-fns";
import { A } from "hookrouter";
import { chain, reduce } from "lodash";
import React, { useEffect, useState } from "react";
import Blankslate from "../../components/blankslate";
import Footer from "../../components/footer";
import Header from "../../components/header";
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
  const [currentDate] = useState(new Date());
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

  // Helpers
  const renderOverview = () => {
    const totalPlanned = getTotalAmountFromArray(formattedBudgets);
    const totalCurrent = getTotalAmountFromArray(formattedExpenses);
    const totalLeft = totalPlanned - totalCurrent;

    return (
      <div className="chart">
        <div className="bar" style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}>
          <span
            className="bar__segment"
            style={{
              backgroundColor: "#54a0e8",
              width: `${(totalCurrent / totalPlanned) * 100}%`
            }}
          ></span>
        </div>
        <ol className="legend">
          <li>
            <span
              className="color-pill"
              style={{ backgroundColor: "#54a0e8" }}
            />
            <span>
              Spent - {formatAmountInCurrency(totalCurrent, currency)}{" "}
              <small>
                ({formatAmountInPercent((totalCurrent / totalPlanned) * 100)})
              </small>
            </span>
          </li>
          <li>
            <span
              className="color-pill"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
            />
            <span>
              Left to spend or save -{" "}
              <mark>{formatAmountInCurrency(totalLeft, currency)}</mark>{" "}
              <small>
                ({formatAmountInPercent((totalLeft / totalPlanned) * 100)})
              </small>
            </span>
          </li>
        </ol>
      </div>
    );
  };

  const renderCategories = () => {
    const formatted = chain(formattedExpenses)
      .map(e => ({
        ...e,
        budget: (budgets.find(b => b.id === e.budget) || {}).name || ""
      }))
      .groupBy("budget")
      .map((b, k) => ({
        name: k,
        color: (budgets.find(b => b.name === k) || {}).color || "#000",
        amount: reduce(b, (prev, curr) => prev + curr.amount, 0)
      }))
      .sortBy(b => -b.amount)
      .value();
    const final = [
      ...formatted.slice(0, 5),
      {
        id: "_others",
        name: "Others",
        amount: getTotalAmountFromArray(formatted.slice(5))
      }
    ];

    return (
      <div className="chart">
        <div className="bar">
          {final.map(({ color, amount }, idx) => (
            <span
              key={`g-${idx}`}
              className="bar__segment"
              style={{
                backgroundColor: color,
                width: `${(amount /
                  getTotalAmountFromArray(formattedExpenses)) *
                  100}%`
              }}
            />
          ))}
        </div>
        <ol className="legend">
          {final.map(({ name, color, amount }, idx) => (
            <li key={`g-${idx}`}>
              <span
                className="color-pill"
                style={{
                  backgroundColor: color || "#212121"
                }}
              />
              <span>
                {name} - {formatAmountInCurrency(amount, currency)}{" "}
                <small>
                  (
                  {formatAmountInPercent(
                    (amount / getTotalAmountFromArray(formattedExpenses)) * 100
                  )}
                  )
                </small>
              </span>
            </li>
          ))}
        </ol>
      </div>
    );
  };

  const renderExpenses = () => {
    if (!formattedExpenses.length) {
      return (
        <Blankslate
          title="Nothing to show"
          description="Looks like there are no expenses to show here yet."
        />
      );
    }

    return (
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Budget</th>
            <th>Payee</th>
            <th className="tar">Amount</th>
          </tr>
        </thead>
        <tbody>
          {formattedExpenses
            .sort(compareBy("date", true))
            .slice(0, 10)
            .map(({ id, date, amount, budget, payee }) => {
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
            })}
        </tbody>
      </table>
    );
  };

  if (loading) {
    return null;
  }

  return (
    <>
      <Header />
      <main>
        <header>
          <h1 className="mb0">Budgets</h1>
          <A
            href={`/new/budget/${getYear(currentDate)}/${getMonth(
              currentDate
            )}`}
          >
            New budget
          </A>
        </header>
        <section>
          <h1>Overview</h1>
          {renderOverview()}
        </section>
        <section>
          <h1>Categories</h1>
          {renderCategories()}
        </section>
        <header>
          <h1 className="mb0">Expenses</h1>
          <A href="/new/expense">New expense</A>
        </header>
        <section>{renderExpenses()}</section>
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
