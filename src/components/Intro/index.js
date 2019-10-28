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
            Spender helps you <mark>track your subscriptions</mark>.
          </h1>
          <p>
            You need to enter each of your subscriptions (e.g. streaming
            service, mobile carrier, broadband), along with how much it costs
            you and how often you pay for it.
          </p>
          <p>
            Spender will break down how much you spend in total per week, month,
            or year. You decide what the limit is!
          </p>
          <p>Ready to give it a try?</p>
          <SignInGoogle />
        </main>
      )
    }
  </AuthUserContext.Consumer>
);

export default Intro;
