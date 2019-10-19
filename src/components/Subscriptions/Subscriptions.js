import React from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import Blankslate from "../Blankslate";
import Loading from "../Loading";
import { withAuthorization, withAuthUser } from "../Session";
import SubscriptionList from "./SubscriptionList";
import SubscriptionSummary from "./SubscriptionSummary";
import {
  addDays,
  addMonths,
  addWeeks,
  addYears,
  isFuture,
  isPast,
  isValid,
  parseISO
} from "date-fns";

class Subscriptions extends React.Component {
  state = {
    subscriptions: [],
    rates: [],
    loading: false,
    error: false,
    mode: "month"
  };

  componentDidMount() {
    this.onListenForData();
  }

  async fetchRates() {
    const response = await fetch(
      `https://api.openrates.io/latest?base=${this.props.authUser.currency}`
    );
    const json = await response.json();

    return json.rates;
  }

  onListenForData() {
    this.setState({ loading: true });

    this.unsubscribe = this.props.firebase
      .subscriptions()
      .where("userId", "==", this.props.authUser.uid)
      .orderBy("name")
      .onSnapshot(async snapshot => {
        if (snapshot.size) {
          let subscriptions = [];

          snapshot.forEach(doc =>
            subscriptions.push({ ...doc.data(), id: doc.id })
          );

          const now = new Date();
          subscriptions = subscriptions.map(s => ({
            ...s,
            dueDate: this.getSubscriptionDueDate(
              now,
              s.startsOn,
              s.repeatMode,
              s.repeatInterval
            )
          }));

          const rates = await this.fetchRates();

          this.setState({ subscriptions, rates, loading: false });
        } else {
          this.setState({ subscriptions: [], rates: [], loading: false });
        }
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getSubscriptionDueDate(now, startsOn, repeatMode, repeatInterval) {
    if (!now || !startsOn) return null;

    const startsOnAsDate = parseISO(startsOn);

    if (!isValid(startsOnAsDate)) return null;

    if (isFuture(startsOnAsDate)) {
      return startsOnAsDate;
    }

    if (isPast(startsOnAsDate)) {
      let nextDate = null;

      switch (repeatMode) {
        case "day":
          nextDate = addDays(startsOnAsDate, repeatInterval);
          break;
        case "week":
          nextDate = addWeeks(startsOnAsDate, repeatInterval);
          break;
        case "month":
          nextDate = addMonths(startsOnAsDate, repeatInterval);
          break;
        case "year":
          nextDate = addYears(startsOnAsDate, repeatInterval);
          break;
        default:
          nextDate = addMonths(startsOnAsDate, repeatInterval);
      }

      return nextDate;
    }

    return null;
  }

  toggleMode = () => {
    const current = this.state.mode;
    if (current === "month") {
      this.setState({ mode: "year" });
    } else {
      this.setState({ mode: "month" });
    }
  };

  render() {
    const { loading, subscriptions, rates, mode } = this.state;

    if (loading) {
      return <Loading isCenter />;
    }

    return (
      <main>
        <header className="mb3">
          <h1 className="mb0">Subscriptions</h1>
          <nav className="nav">
            <Link to="/new">New subscription</Link>
          </nav>
        </header>
        {subscriptions.length ? (
          <>
            <SubscriptionList subscriptions={subscriptions} />
            <SubscriptionSummary
              subscriptions={subscriptions}
              rates={rates}
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
