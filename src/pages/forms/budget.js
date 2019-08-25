import { navigate } from "hookrouter";
import React, { useState, useEffect } from "react";
import { CirclePicker } from "react-color";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { BUDGET_NAMES } from "../../datalists";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { ID, renderDatalistFromArray } from "../../utils";

const Budget = ({ id }) => {
  // Local storage
  const [budgets, setBudgets] = useLocalStorage("budgets", []);

  // State
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [color, setColor] = useState("#000000");

  // Effects
  useEffect(() => {
    if (id) {
      const { name, amount, color } = budgets.find(b => b.id === id) || {};

      if (!name) {
        navigate("/dashboard");
      }

      setName(name);
      setAmount(amount);
      setColor(color);
    }
  }, [id, budgets]);

  // Events
  const onSubmit = e => {
    e.preventDefault();

    setBudgets([
      ...budgets,
      {
        id: ID(),
        date: new Date(),
        name,
        amount,
        color
      }
    ]);

    navigate("/dashboard");
  };

  const onDelete = (e, id) => {
    e.preventDefault();

    if (window.confirm("Are you sure you want to delete this budget?")) {
      setBudgets(budgets.filter(b => b.id !== id));

      navigate("/dashboard");
    }
  };

  return (
    <>
      <Header />
      <main>
        <h2>New budget</h2>
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
            <p>
              <a className="danger" href="/" onClick={e => onDelete(e, id)}>
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
