import React from "react";
import { Link } from "react-router-dom";
import { AuthUserContext } from "../Session";

const Header = () => (
  <header className="header">
    <div className="header-inner">
      <AuthUserContext.Consumer>
        {authUser =>
          authUser ? (
            <>
              <Link to="/">Spender</Link>
              <nav>
                <Link to="/subscriptions">Dashboard</Link>
                <Link to="/upcoming">Upcoming</Link>
                <Link to="/settings">Settings</Link>
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

export default Header;
