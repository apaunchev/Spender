import React from "react";
import { BrowserRouter as Router, Route, Switch } from "react-router-dom";
import * as ROUTES from "../../constants/routes";
import Categories from "../Categories";
import Expenses from "../Expenses";
import Footer from "../Footer";
import Category from "../Forms/Category";
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

      <Route exact path={ROUTES.EXPENSES} component={Expenses} />
      <Route exact path={ROUTES.NEW_EXPENSE} component={Expense} />
      <Route exact path={ROUTES.EDIT_EXPENSE} component={Expense} />

      <Route exact path={ROUTES.CATEGORIES} component={Categories} />
      <Route exact path={ROUTES.NEW_CATEGORY} component={Category} />
      <Route exact path={ROUTES.EDIT_CATEGORY} component={Category} />

      <Route exact path={ROUTES.SETTINGS} component={Settings} />

      <Route component={NoMatch} />
    </Switch>
    <Footer />
  </Router>
);

export default withAuthentication(App);
