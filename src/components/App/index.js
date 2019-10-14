import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import Header from "../Header";
import Intro from "../Intro";
import Settings from "../Settings";
import NoMatch from "../NoMatch";
import { withAuthentication } from "../Session";
import { SubscriptionForm, Subscriptions } from "../Subscriptions";

const App = () => (
  <Router>
    <Header />
    <Switch>
      <Route exact path={ROUTES.INTRO} component={Intro} />

      <Route exact path={ROUTES.SUBSCRIPTIONS} component={Subscriptions} />
      <Route exact path={ROUTES.UPDATE} component={SubscriptionForm} />
      <Route exact path={ROUTES.NEW} component={SubscriptionForm} />

      <Route exact path={ROUTES.SETTINGS} component={Settings} />

      <Route component={NoMatch} />
    </Switch>
  </Router>
);

export default withAuthentication(App);
