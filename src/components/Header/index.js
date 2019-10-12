import React from "react";
import { Link } from "react-router-dom";
import { AuthUserContext } from "../Session";

const Header = () => (
  <header>
    <AuthUserContext.Consumer>
      {authUser =>
        authUser ? (
          <nav>
            <Link to="/">Spender</Link>
            <Link to="/">Dashboard</Link>
            <Link to="/settings">Settings</Link>
          </nav>
        ) : (
          <nav>
            <Link to="/">Spender</Link>
          </nav>
        )
      }
    </AuthUserContext.Consumer>
  </header>
);

export default Header;
