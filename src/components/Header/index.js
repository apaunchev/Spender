import React from "react";
import { Link } from "react-router-dom";
import { withFirebase } from "../Firebase";
import { AuthUserContext } from "../Session";

const Header = ({ firebase }) => {
  const doSignOut = event => {
    event.preventDefault();

    firebase.doSignOut();
  };

  return (
    <header className="header">
      <div className="header-inner">
        <AuthUserContext.Consumer>
          {authUser =>
            authUser ? (
              <>
                <Link to="/dashboard">Spender</Link>
                <nav>
                  <Link to="/expenses">Expenses</Link>
                  <Link to="/budgets">Budgets</Link>
                  <Link to="/settings">Settings</Link>
                  <a href="/" onClick={doSignOut}>
                    Sign out
                  </a>
                </nav>
              </>
            ) : (
              <Link to="/">Spender</Link>
            )
          }
        </AuthUserContext.Consumer>
      </div>
    </header>
  );
};

export default withFirebase(Header);
