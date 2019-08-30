import React from "react";
import Intro from "./pages/intro";
import Dashboard from "./pages/dashboard";
import Expenses from "./pages/expenses";
import { Expense, Budget } from "./pages/forms";
import Settings from "./pages/settings";

const routes = {
  "/": () => <Intro />,
  "/dashboard": () => <Dashboard />,
  "/expenses": () => <Expenses />,
  "/new/expense": () => <Expense />,
  "/expense/:id": ({ id }) => <Expense id={id} />,
  "/new/budget/:year/:month": ({ year, month }) => (
    <Budget year={year} month={month} />
  ),
  "/budget/:id": ({ id }) => <Budget id={id} />,
  "/settings": () => <Settings />
};

export default routes;
