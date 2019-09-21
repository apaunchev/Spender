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
          <h1>Spender is a simple budgeting app.</h1>
          <p>
            All you need to do is set up your monthly <strong>budget</strong>{" "}
            for things like groceries and rent, and then start tracking your{" "}
            <strong>expenses</strong> on a daily basis.
          </p>
          <p>
            Using simple visualizations, the app will help you understand how
            much you spend and on what, along with how much you can save every
            month.
          </p>
          <p>Ready to give it a try?</p>
          <SignInGoogle />
        </main>
      )
    }
  </AuthUserContext.Consumer>
);

export default Intro;
