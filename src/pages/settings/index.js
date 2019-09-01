import { navigate } from "hookrouter";
import React, { useState } from "react";
import Footer from "../../components/footer";
import Header from "../../components/header";
import { CURRENCIES } from "../../consts";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import { LOCAL_STORAGE_PREFIX } from "../../consts";
import { saveAs } from "file-saver";

const Settings = () => {
  // Local storage
  const [budgets] = useLocalStorage("budgets", {});
  const [expenses] = useLocalStorage("expenses", {});
  const [settings, setSettings] = useLocalStorage("settings", {});

  // State
  const [currency, setCurrency] = useState(settings.currency || "EUR");
  const [dashboardLimit, setDashboardLimit] = useState(
    settings.dashboardLimit || 5
  );

  // Events
  const onSubmit = e => {
    e.preventDefault();

    setSettings({ ...settings, currency, dashboardLimit });

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

  const onExport = e => {
    e.preventDefault();

    try {
      const dataToExport = {
        budgets: JSON.parse(
          window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}budgets`)
        ),
        expenses: JSON.parse(
          window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}expenses`)
        ),
        settings: JSON.parse(
          window.localStorage.getItem(`${LOCAL_STORAGE_PREFIX}settings`)
        )
      };
      const blob = new Blob([JSON.stringify(dataToExport)], {
        type: "application/json"
      });

      saveAs(
        blob,
        `${LOCAL_STORAGE_PREFIX}export_${new Date().getTime()}.json`
      );
    } catch (error) {
      console.error(error);
    }
  };

  const onFileSelect = e => {
    const inputFiles = e.target.files;
    const reader = new FileReader();

    reader.onload = () => {
      const { budgets, expenses, settings } = JSON.parse(reader.result);

      if (!budgets || !expenses || !settings) {
        console.error("No data to import in selected file.");
        return;
      }

      if (
        window.confirm(
          `The selected file contains ${budgets.length} budgets and ${expenses.length} expenses. Importing it will overwrite existing data and this cannot be undone. Proceed?`
        )
      ) {
        try {
          window.localStorage.setItem(
            `${LOCAL_STORAGE_PREFIX}budgets`,
            JSON.stringify(budgets)
          );
          window.localStorage.setItem(
            `${LOCAL_STORAGE_PREFIX}expenses`,
            JSON.stringify(expenses)
          );
          window.localStorage.setItem(
            `${LOCAL_STORAGE_PREFIX}settings`,
            JSON.stringify(settings)
          );

          navigate("/dashboard");
        } catch (error) {
          console.error(error);
        }
      }
    };

    reader.readAsText(inputFiles[0]);
  };

  return (
    <>
      <Header />
      <main>
        <h1>Settings</h1>
        <form className="form" onSubmit={onSubmit}>
          <div className="form-input">
            <label htmlFor="currency">Currency</label>
            <p className="mb2">
              <small>Controls the currency sign used across the app.</small>
            </p>
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
            <label htmlFor="dashboardLimit">Dashboard limit</label>
            <p className="mb2">
              <small>
                Controls how many items per section to show on the dashboard.
              </small>
            </p>
            <input
              type="number"
              id="dashboardLimit"
              name="dashboardLimit"
              min={1}
              max={20}
              step={1}
              value={dashboardLimit}
              onChange={e => setDashboardLimit(e.target.value)}
            />
          </div>
          <div className="form-input">
            <input
              type="submit"
              className="button button--primary"
              value="Save"
            />
          </div>
        </form>
        <hr />
        <h2>Manage your data</h2>
        <p>
          Currently you have <strong>{budgets.length || 0} budgets</strong> and{" "}
          <strong>{expenses.length || 0} expenses</strong> stored on your
          device.
        </p>
        <div className="button-group">
          <button className="button" onClick={onExport}>
            Export
          </button>
          <label htmlFor="import" className="button">
            Import
          </label>
          <input
            type="file"
            id="import"
            name="import"
            onChange={onFileSelect}
            accept=".json"
            style={{ display: "none" }}
          />
          <button className="button" onClick={e => onDelete(e)}>
            Erase
          </button>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default Settings;
