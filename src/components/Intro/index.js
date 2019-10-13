import React from "react";
import { Redirect } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import { AuthUserContext } from "../Session";
import { SignInGoogle } from "../SignIn";

const Intro = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? (
        <Redirect to={ROUTES.SUBSCRIPTIONS} />
      ) : (
        <main className="jumbo">
          <h1>
            Spender is a simple tracker for your bills and recurring expenses.
          </h1>
          <SignInGoogle />
        </main>
      )
    }
  </AuthUserContext.Consumer>
);

export default Intro;
