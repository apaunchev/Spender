import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import Budgets from "../Budgets";
import Clone from "../Clone";
import Dashboard from "../Dashboard";
import Expenses from "../Expenses";
import Footer from "../Footer";
import Budget from "../Forms/Budget";
import Expense from "../Forms/Expense";
import Header from "../Header";
import Intro from "../Intro";
import NoMatch from "../NoMatch";
import { withAuthentication } from "../Session";
import Settings from "../Settings";

const App = () => (
  <Router>
    <Header />
    <Switch>
      <Route exact path={ROUTES.INTRO} component={Intro} />
      <Route exact path={ROUTES.DASHBOARD} component={Dashboard} />
      <Route exact path={ROUTES.SETTINGS} component={Settings} />

      <Route exact path={ROUTES.EXPENSES} component={Expenses} />
      <Route exact path={ROUTES.NEW_EXPENSE} component={Expense} />
      <Route exact path={ROUTES.EDIT_EXPENSE} component={Expense} />

      <Route exact path={ROUTES.BUDGETS} component={Budgets} />
      <Route exact path={ROUTES.NEW_BUDGET} component={Budget} />
      <Route exact path={ROUTES.EDIT_BUDGET} component={Budget} />
      <Route exact path={ROUTES.CLONE_BUDGET} component={Clone} />

      <Route component={NoMatch} />
    </Switch>
    <Footer />
  </Router>
);

export default withAuthentication(App);
