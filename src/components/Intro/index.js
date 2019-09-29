import React from "react";
import { Redirect } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import { AuthUserContext } from "../Session";
import { SignInGoogle } from "../SignIn";

const Intro = () => (
  <AuthUserContext.Consumer>
    {authUser =>
      authUser ? (
        <Redirect to={ROUTES.EXPENSES} />
      ) : (
        <main className="jumbo">
          <h1>Spender is a simple expense tracker.</h1>
          <SignInGoogle />
        </main>
      )
    }
  </AuthUserContext.Consumer>
);

export default Intro;
