import { navigate } from "hookrouter";
import React, { useState } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { CURRENCIES } from "../../datalists";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { LOCAL_STORAGE_PREFIX } from "../../consts";

const Settings = () => {
  // Local storage
  const [budgets] = useLocalStorage("budgets", {});
  const [expenses] = useLocalStorage("expenses", {});
  const [settings, setSettings] = useLocalStorage("settings", {});

  // State
  const [currency, setCurrency] = useState(settings.currency || "EUR");

  // Events
  const onSubmit = e => {
    e.preventDefault();

    setSettings({ ...settings, currency });

    navigate("/dashboard");
  };

  const onDelete = e => {
    e.preventDefault();

    try {
      if (
        window.confirm(
          "Are you sure you want to erase your data? This operation cannot be undone."
        )
      ) {
        window.localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}budgets`);
        window.localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}expenses`);
        window.localStorage.removeItem(`${LOCAL_STORAGE_PREFIX}settings`);

        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Header />
      <main>
        <h2>Settings</h2>
        <form className="form" onSubmit={onSubmit}>
          <div className="form-input">
            <label htmlFor="currency">Currency</label>
            <select
              name="currency"
              id="currency"
              value={currency}
              onChange={e => setCurrency(e.target.value)}
            >
              {CURRENCIES.map((c, idx) => (
                <option key={`${c}-${idx}`} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="form-input">
            <input
              type="submit"
              className="button button--primary"
              value="Save"
            />
          </div>
          <h3>Stored data</h3>
          <p>
            Currently you have <strong>{budgets.length || 0} budgets</strong>{" "}
            and <strong>{expenses.length || 0} expenses</strong> stored on your
            device, along with the settings from this page.
          </p>
          <p className="danger">
            <a href="/" onClick={e => onDelete(e)}>
              Erase stored data
            </a>
          </p>
        </form>
      </main>
      <Footer />
    </>
  );
};

export default Settings;
