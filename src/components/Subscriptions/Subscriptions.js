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
  addWeeks,
  endOfWeek,
  endOfMonth,
  endOfYear,
  isBefore
} from "date-fns";

const MODES = {
  WEEK: "week",
  MONTH: "month",
  YEAR: "year"
};

const SUMMARY_INITIAL_STATE = {
  average: {
    week: 0,
    month: 0,
    year: 0
  },
  remaining: {
    week: 0,
    month: 0,
    year: 0
  }
};

const DEFAULTS = {
  currency: "EUR",
  orderBy: "name|asc",
  totalAs: "average"
};

class Subscriptions extends React.Component {
  state = {
    subscriptions: [],
    summary: {},
    currency: "",
    totalAs: "",
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

  getNextDueDate = (date, repeatMode) => {
    const firstDue = parseISO(date);

    if (!isValid(firstDue)) return null;

    // if first due date is in the future, return it now
    if (isFuture(firstDue)) return firstDue;

    // otherwise, we assume it is in the past and need to calculate it
    const now = new Date();

    if (repeatMode === MODES.WEEK) {
      return addWeeks(firstDue, Math.abs(differenceInWeeks(firstDue, now)) + 1);
    }

    if (repeatMode === MODES.MONTH) {
      return addMonths(
        firstDue,
        Math.abs(differenceInMonths(firstDue, now)) + 1
      );
    }

    if (repeatMode === MODES.YEAR) {
      return addYears(firstDue, Math.abs(differenceInYears(firstDue, now)) + 1);
    }
  };

  getAverageAmounts = (amount, repeatMode) => {
    const average = { week: 0, month: 0, year: 0 };

    if (repeatMode === MODES.WEEK) {
      average.week = amount;
      average.month = amount * 4;
      average.year = amount * 52;
    }

    if (repeatMode === MODES.MONTH) {
      average.week = amount / 4;
      average.month = amount;
      average.year = amount * 12;
    }

    if (repeatMode === MODES.YEAR) {
      average.week = amount / 52;
      average.month = amount / 12;
      average.year = amount;
    }

    return average;
  };

  getRemainingAmounts = (amount, repeatMode, dueDate) => {
    const now = new Date();
    const endOf = {
      week: endOfWeek(now),
      month: endOfMonth(now),
      year: endOfYear(now)
    };
    let currentDueDate = dueDate;
    let remaining = { week: 0, month: 0, year: 0 };

    if (repeatMode === MODES.WEEK) {
      while (isBefore(currentDueDate, endOf.year)) {
        if (isBefore(currentDueDate, endOf.week)) {
          remaining.week += amount;
        }

        if (isBefore(currentDueDate, endOf.month)) {
          remaining.month += amount;
        }

        if (isBefore(currentDueDate, endOf.year)) {
          remaining.year += amount;
        }

        currentDueDate = addWeeks(currentDueDate, 1);
      }
    }

    if (repeatMode === MODES.MONTH) {
      while (isBefore(currentDueDate, endOf.year)) {
        if (isBefore(currentDueDate, endOf.week)) {
          remaining.week += amount;
        }

        if (isBefore(currentDueDate, endOf.month)) {
          remaining.month += amount;
        }

        if (isBefore(currentDueDate, endOf.year)) {
          remaining.year += amount;
        }

        currentDueDate = addMonths(currentDueDate, 1);
      }
    }

    if (repeatMode === MODES.YEAR) {
      while (isBefore(currentDueDate, endOf.year)) {
        if (isBefore(currentDueDate, endOf.week)) {
          remaining.week += amount;
        }

        if (isBefore(currentDueDate, endOf.month)) {
          remaining.month += amount;
        }

        if (isBefore(currentDueDate, endOf.year)) {
          remaining.year += amount;
        }

        currentDueDate = addYears(currentDueDate, 1);
      }
    }

    return remaining;
  };

  onListenForData() {
    const { firebase, authUser } = this.props;

    this.setState({ loading: true });

    firebase
      .user(authUser.uid)
      .get()
      .then(async doc => {
        if (doc.exists) {
          const data = doc.data();
          const currency = data.currency || DEFAULTS.currency;
          const totalAs = data.totalAs || DEFAULTS.totalAs;
          const orderBy = data.orderBy || DEFAULTS.orderBy;
          const [field, direction] = orderBy.split("|");
          const rates = await this.fetchRates(currency);
          const mapFn = sub => {
            const dueDate = this.getNextDueDate(sub.startsOn, sub.repeatMode);
            const amount = sub.amount / rates[sub.currency] || sub.amount;
            const averageAmounts = this.getAverageAmounts(
              amount,
              sub.repeatMode
            );
            const remainingAmounts = this.getRemainingAmounts(
              amount,
              sub.repeatMode,
              dueDate
            );

            return {
              ...sub,
              amount,
              dueDate,
              averageAmounts,
              remainingAmounts
            };
          };
          const reduceFn = (acc, curr) => {
            const { averageAmounts, remainingAmounts } = curr;

            return {
              average: {
                week: acc.average.week + averageAmounts.week,
                month: acc.average.month + averageAmounts.month,
                year: acc.average.year + averageAmounts.year
              },
              remaining: {
                week: acc.remaining.week + remainingAmounts.week,
                month: acc.remaining.month + remainingAmounts.month,
                year: acc.remaining.year + remainingAmounts.year
              }
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
                let summary = SUMMARY_INITIAL_STATE;

                snapshot.forEach(doc =>
                  subscriptions.push({ ...doc.data(), id: doc.id })
                );

                subscriptions = subscriptions.map(mapFn);
                summary = subscriptions.reduce(reduceFn, summary);

                this.setState({
                  subscriptions,
                  summary,
                  currency,
                  totalAs,
                  loading: false
                });
              } else {
                this.setState({
                  subscriptions: [],
                  summary: {},
                  currency: "",
                  totalAs: "",
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
    const {
      loading,
      subscriptions,
      summary,
      currency,
      totalAs,
      mode
    } = this.state;

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
            <SubscriptionList
              subscriptions={subscriptions}
              currency={currency}
            />
            <SubscriptionSummary
              summary={summary}
              currency={currency}
              totalAs={totalAs}
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
