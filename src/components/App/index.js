import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import Header from "../Header";
import NoMatch from "../NoMatch";
import { withAuthentication } from "../Session";
import Dashboard from "../Dashboard";
import Settings from "../Settings";
import SubscriptionForm from "../SubscriptionForm";

const App = () => (
  <Router>
    <Header />
    <Switch>
      <Route exact path={ROUTES.DASHBOARD} component={Dashboard} />
      <Route exact path={ROUTES.SETTINGS} component={Settings} />
      <Route exact path={ROUTES.ADD} component={SubscriptionForm} />
      <Route exact path={ROUTES.EDIT} component={SubscriptionForm} />
      <Route component={NoMatch} />
    </Switch>
  </Router>
);

export default withAuthentication(App);
