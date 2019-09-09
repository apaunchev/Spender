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
          <h1>
            Spender is a budgeting app with a focus on simplicity and privacy.
          </h1>
          <p>
            To use it, all you need to do is set up your monthly{" "}
            <strong>budgets</strong> for things like groceries and rent, and
            then start tracking your daily <strong>expenses</strong>.
          </p>
          <p>
            Using clean and simple visualizations, the app will then help you
            understand how much you spend and on what, along with how much you
            can save every month. We don’t care about your income, net worth, or
            credit; there are better apps for tracking those.
          </p>
          <SignInGoogle />
        </main>
      )
    }
  </AuthUserContext.Consumer>
);

export default Intro;
