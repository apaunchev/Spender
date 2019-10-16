import React from "react";
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
    loading: false,
    error: false
  };

  componentDidMount() {
    this.onListenForSubscriptions();
  }

  onListenForSubscriptions() {
    const { firebase, authUser } = this.props;

    const split = ((authUser || {}).orderBy || {}).split("|");
    const field = split[0];
    const direction = split[1];

    this.setState({ loading: true });

    this.unsubscribe = firebase
      .subscriptions()
      .where("userId", "==", authUser.uid)
      .orderBy(field, direction)
      .onSnapshot(snapshot => {
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
              s.startedAt,
              s.repeatMode,
              s.repeatInterval
            )
          }));

          this.setState({ subscriptions, loading: false });
        } else {
          this.setState({ subscriptions: [], loading: false });
        }
      });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

  getSubscriptionDueDate(now, startedAt, repeatMode, repeatInterval) {
    if (!now || !startedAt) return null;

    const startedAtAsDate = parseISO(startedAt);

    if (!isValid(startedAtAsDate)) return null;

    if (isFuture(startedAtAsDate)) {
      return startedAtAsDate;
    }

    if (isPast(startedAtAsDate)) {
      let nextDate = null;

      switch (repeatMode) {
        case "day":
          nextDate = addDays(startedAtAsDate, repeatInterval);
          break;
        case "week":
          nextDate = addWeeks(startedAtAsDate, repeatInterval);
          break;
        case "month":
          nextDate = addMonths(startedAtAsDate, repeatInterval);
          break;
        case "year":
          nextDate = addYears(startedAtAsDate, repeatInterval);
          break;
        default:
          nextDate = addMonths(startedAtAsDate, repeatInterval);
      }

      return nextDate;
    }

    return null;
  }

  render() {
    const { loading, subscriptions } = this.state;

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
            <SubscriptionSummary subscriptions={subscriptions} />
            <hr />
            <SubscriptionList subscriptions={subscriptions} />
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
