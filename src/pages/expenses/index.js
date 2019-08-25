import {
  addMonths,
  format,
  isWithinInterval,
  startOfMonth,
  endOfMonth,
  subMonths
} from "date-fns";
import { A } from "hookrouter";
import React, { useState, useEffect } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { compareBy, formatAmountInCurrency } from "../../utils";

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

  if (loading) {
    return null;
  }

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
          <div className="table-wrap">
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
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Expenses;
