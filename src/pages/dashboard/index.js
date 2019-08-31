import { endOfMonth, isWithinInterval, startOfMonth } from "date-fns";
import { A } from "hookrouter";
import React, { useEffect, useState } from "react";
import Blankslate from "../../components/blankslate";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import {
  compareBy,
  formatAmountInCurrency,
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
      <h1>
        You have <span className={className}>{formattedAmount}</span> left to
        spend or save this month.
      </h1>
    );
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
        {renderBalanceMessage(
          totalPlanned - totalCurrent,
          currency,
          formattedBudgets
        )}
        <A href="/new/expense" className="button button--primary jumbo">
          New expense →
        </A>
        <hr />
        <header className="mb3">
          <h2 className="mb0">Recent expenses</h2>
          <A href="/expenses">See all</A>
        </header>
        {formattedExpenses.length ? (
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

export default Dashboard;
