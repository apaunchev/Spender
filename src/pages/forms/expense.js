import { navigate } from "hookrouter";
import React, { useState, useEffect } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { ID, toDateInputValue } from "../../utils";
import { format } from "date-fns";

const Expense = ({ id }) => {
  // Local storage
  const [expenses, setExpenses] = useLocalStorage("expenses", []);
  const [budgets] = useLocalStorage("budgets", []);

  // State
  const [amount, setAmount] = useState("");
  const [budget, setBudget] = useState("");
  const [date, setDate] = useState(toDateInputValue(new Date()));
  const [payee, setPayee] = useState("");
  const [notes, setNotes] = useState("");

  // Effects
  useEffect(() => {
    if (id) {
      const { amount, budget, date, payee, notes } =
        expenses.find(e => e.id === id) || {};

      if (!amount) {
        navigate("/dashboard");
      }

      setAmount(amount);
      setBudget(budget);
      setDate(format(new Date(date), "yyyy-MM-dd"));
      setPayee(payee);
      setNotes(notes);
    }
  }, [id, expenses]);

  // Events
  const onSubmit = e => {
    e.preventDefault();

    if (!id) {
      // create
      setExpenses([
        ...expenses,
        {
          id: ID(),
          date,
          amount,
          budget,
          payee,
          notes
        }
      ]);
    } else {
      // update
      setExpenses(
        expenses.map(e =>
          e.id === id ? { id, date, amount, budget, payee, notes } : e
        )
      );
    }

    navigate("/expenses");
  };

  const onDelete = (e, id) => {
    e.preventDefault();

    if (window.confirm("Are you sure you want to delete this expense?")) {
      setExpenses(expenses.filter(e => e.id !== id));

      navigate("/expenses");
    }
  };

  return (
    <>
      <Header />
      <main>
        <h2>{!id ? "New" : "Edit"} expense</h2>
        <form className="form" onSubmit={onSubmit}>
          <div className="form-input">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              min="0"
              step="0.01"
              placeholder="19.90"
              value={amount}
              onChange={e => setAmount(parseFloat(e.target.value))}
              required
              autoFocus
            />
          </div>
          <div className="form-input">
            <label htmlFor="budget">Budget</label>
            <select
              name="budget"
              id="budget"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              required
            >
              <option value="" disabled hidden>
                Select a budget...
              </option>
              {budgets.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-input">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-input">
            <label htmlFor="payee">Payee</label>
            <input
              type="text"
              id="payee"
              placeholder="Amazon"
              value={payee}
              onChange={e => setPayee(e.target.value)}
            />
          </div>
          <div className="form-input">
            <label htmlFor="notes">Notes</label>
            <input
              type="text"
              id="notes"
              value={notes}
              onChange={e => setNotes(e.target.value)}
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
            <p>
              <a className="danger" href="/" onClick={e => onDelete(e, id)}>
                Delete
              </a>
            </p>
          )}
        </form>
      </main>
      <Footer />
    </>
  );
};

export default Expense;
