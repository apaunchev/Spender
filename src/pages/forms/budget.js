import { format, subMonths, addMonths, parseISO } from "date-fns";
import { navigate } from "hookrouter";
import React, { useState, useEffect } from "react";
import { CirclePicker } from "react-color";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { BUDGET_NAMES } from "../../datalists";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { ID, renderDatalistFromArray } from "../../utils";
import { DATE_FORMAT_ISO, DATE_FORMAT_HUMAN_SHORT } from "../../consts";

const Budget = ({ id, year, month }) => {
  // Local storage
  const [budgets, setBudgets] = useLocalStorage("budgets", []);
  const [expenses, setExpenses] = useLocalStorage("expenses", []);

  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [color, setColor] = useState("#000000");

  // Effects
  useEffect(() => {
    if (id) {
      const { date, name, amount, color } =
        budgets.find(b => b.id === id) || {};

      if (!name) {
        navigate("/dashboard");
      }

      setCurrentDate(parseISO(date));
      setName(name);
      setAmount(amount);
      setColor(color);
    }

    if (year && month) {
      setCurrentDate(new Date(year, month, 1));
    }
  }, [id, year, month, budgets]);

  // Events
  const onSubmit = e => {
    e.preventDefault();

    if (!id) {
      // create
      setBudgets([
        ...budgets,
        {
          id: ID(),
          date: format(currentDate, DATE_FORMAT_ISO),
          name,
          amount,
          color
        }
      ]);
    } else {
      // update
      setBudgets(
        budgets.map(b =>
          b.id === id ? { id, date: currentDate, name, amount, color } : b
        )
      );
    }

    navigate("/dashboard");
  };

  const onDelete = (e, id) => {
    e.preventDefault();
    if (
      window.confirm(
        "Deleting this budget will also delete all expenses linked to it. Proceed?"
      )
    ) {
      setBudgets(budgets.filter(b => b.id !== id));
      setExpenses(expenses.filter(e => e.budget !== id));

      navigate("/dashboard");
    }
  };

  return (
    <>
      <Header />
      <header className="mb3 flex flex--between">
        <div>
          <h2>{!id ? "New" : "Edit"} budget</h2>
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
            {format(currentDate, DATE_FORMAT_HUMAN_SHORT)}
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
      <main>
        <form className="form" onSubmit={onSubmit}>
          <div className="form-input">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              list="budgets"
              placeholder="Groceries"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-input">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              min="0"
              step="0.01"
              placeholder="200"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value))}
              required
            />
          </div>
          <div className="form-input">
            <label htmlFor="color">Color</label>
            <CirclePicker
              color={color}
              onChangeComplete={color => setColor(color.hex)}
            />
          </div>
          <div className="form-input">
            <input
              type="submit"
              className="button button--primary"
              value="Save"
            />
          </div>
          {id && (
            <p className="danger">
              <a href="/" onClick={e => onDelete(e, id)}>
                Delete
              </a>
            </p>
          )}
        </form>
        {renderDatalistFromArray(BUDGET_NAMES, "budgets")}
      </main>
      <Footer />
    </>
  );
};

export default Budget;
