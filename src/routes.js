import React from "react";
import Clone from "./pages/clone";
import Intro from "./pages/intro";
import Dashboard from "./pages/dashboard";
import Expenses from "./pages/expenses";
import { Expense, Budget } from "./pages/forms";
import Settings from "./pages/settings";

const routes = {
  "/": () => <Intro />,
  "/dashboard": () => <Dashboard />,
  "/expenses": () => <Expenses />,
  "/expenses/:budgetId": ({ budgetId }) => <Expenses budgetId={budgetId} />,
  "/new/expense": () => <Expense />,
  "/expense/:id": ({ id }) => <Expense id={id} />,
  "/new/budget/:year/:month": ({ year, month }) => (
    <Budget year={year} month={month} />
  ),
  "/budget/:id": ({ id }) => <Budget id={id} />,
  "/clone/:year/:month": ({ year, month }) => (
    <Clone year={year} month={month} />
  ),
  "/settings": () => <Settings />
};

export default routes;
