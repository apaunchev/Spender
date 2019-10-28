import React from "react";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import Blankslate from "../Blankslate";
import Loading from "../Loading";
import { withAuthorization, withAuthUser } from "../Session";
import SubscriptionList from "./SubscriptionList";
import SubscriptionSummary from "./SubscriptionSummary";
import {
  parseISO,
  isValid,
  isFuture,
  addYears,
  differenceInYears,
  differenceInMonths,
  differenceInWeeks,
  addMonths,
  addWeeks
} from "date-fns";

const MODES = {
  WEEK: "week",
  MONTH: "month",
  YEAR: "year"
};

class Subscriptions extends React.Component {
  state = {
    subscriptions: [],
    averages: {},
    currency: "",
    loading: false,
    mode: MODES.MONTH
  };

  componentDidMount() {
    this.onListenForData();
  }

  async fetchRates(currency) {
    const response = await fetch(
      `https://api.openrates.io/latest?base=${currency}`
    );
    const json = await response.json();

    return json.rates;
  }

  onListenForData() {
    const { firebase, authUser } = this.props;

    this.setState({ loading: true });

    firebase
      .user(authUser.uid)
      .get()
      .then(async doc => {
        if (doc.exists) {
          const { currency, orderBy } = doc.data();
          const [field, direction] = orderBy.split("|");
          const rates = await this.fetchRates(currency);

          const getNextDueDate = (date, repeatMode) => {
            const firstDue = parseISO(date);

            if (!isValid(firstDue)) return null;

            // if first due date is in the future, return it now
            if (isFuture(firstDue)) return firstDue;

            // otherwise, we assume it is in the past and need to calculate it
            const now = new Date();

            if (repeatMode === MODES.WEEK) {
              return addWeeks(
                firstDue,
                Math.abs(differenceInWeeks(firstDue, now)) + 1
              );
            }

            if (repeatMode === MODES.MONTH) {
              return addMonths(
                firstDue,
                Math.abs(differenceInMonths(firstDue, now)) + 1
              );
            }

            if (repeatMode === MODES.YEAR) {
              return addYears(
                firstDue,
                Math.abs(differenceInYears(firstDue, now)) + 1
              );
            }
          };

          const mapFn = sub => {
            const dueDate = getNextDueDate(sub.startsOn, sub.repeatMode);
            const amount = sub.amount / rates[sub.currency] || sub.amount;

            return { ...sub, amount, dueDate };
          };

          const reduceFn = (acc, curr) => {
            const { amount, repeatMode } = curr;
            let week = 0;
            let month = 0;
            let year = 0;

            if (repeatMode === MODES.WEEK) {
              week = amount;
              month = amount * 4;
              year = amount * 52;
            }

            if (repeatMode === MODES.MONTH) {
              week = amount / 4;
              month = amount;
              year = amount * 12;
            }

            if (repeatMode === MODES.YEAR) {
              week = amount / 52;
              month = amount / 12;
              year = amount;
            }

            return {
              week: acc.week + week,
              month: acc.month + month,
              year: acc.year + year
            };
          };

          firebase
            .subscriptions()
            .where("userId", "==", authUser.uid)
            .orderBy(field, direction)
            .get()
            .then(snapshot => {
              if (snapshot.size) {
                let subscriptions = [];
                let averages = { week: 0, month: 0, year: 0 };

                snapshot.forEach(doc =>
                  subscriptions.push({ ...doc.data(), id: doc.id })
                );

                subscriptions = subscriptions.map(mapFn);
                averages = subscriptions.reduce(reduceFn, averages);

                this.setState({
                  subscriptions,
                  averages,
                  currency,
                  loading: false
                });
              } else {
                this.setState({
                  subscriptions: [],
                  averages: {},
                  currency: "",
                  loading: false
                });
              }
            });
        }
      });
  }

  toggleMode = () => {
    const current = this.state.mode;

    if (current === MODES.MONTH) {
      this.setState({ mode: MODES.YEAR });
    } else if (current === MODES.YEAR) {
      this.setState({ mode: MODES.WEEK });
    } else if (current === MODES.WEEK) {
      this.setState({ mode: MODES.MONTH });
    }
  };

  render() {
    const { loading, subscriptions, averages, currency, mode } = this.state;

    if (loading) {
      return <Loading isCenter />;
    }

    return (
      <main>
        <header className="mb3">
          <h1 className="mb0">Subscriptions</h1>
          <Link to="/new">New subscription</Link>
        </header>
        {subscriptions.length ? (
          <>
            <SubscriptionList subscriptions={subscriptions} />
            <SubscriptionSummary
              averages={averages}
              currency={currency}
              mode={mode}
              onToggleMode={this.toggleMode}
            />
          </>
        ) : (
          <Blankslate
            title="Nothing to show"
            description="Looks like you have not added any subscriptions yet."
          />
        )}
      </main>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthUser,
  withAuthorization(condition)
)(Subscriptions);
