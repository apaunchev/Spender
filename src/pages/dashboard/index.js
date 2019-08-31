import { endOfMonth, isWithinInterval, startOfMonth } from "date-fns";
import { A } from "hookrouter";
import React, { useEffect, useState } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import MonthNav from "../../components/month-nav";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { formatAmountInCurrency, getTotalAmountFromArray } from "../../utils";

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
        <header className="mb3 flex flex--between">
          <div>
            <h2 className="mb0">Dashboard</h2>
            <A href="/new/expense">New expense</A>
          </div>
          <MonthNav currentDate={currentDate} setCurrentDate={setCurrentDate} />
        </header>
        {renderBalanceMessage(
          totalPlanned - totalCurrent,
          currency,
          formattedBudgets
        )}
      </main>
      <Footer />
    </>
  );
};

export default Dashboard;
