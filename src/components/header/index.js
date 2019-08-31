import React from "react";
import { A } from "hookrouter";

const Header = () => (
  <header className="header">
    <div className="header-inner">
      <A href="/dashboard">Spender</A>
      <nav>
        <A href="/budgets">Budgets</A>
        <A href="/expenses">Expenses</A>
        <A href="/settings">Settings</A>
      </nav>
    </div>
  </header>
);

export default Header;
