import React from "react";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import MODES from "../../constants/modes";
import Blankslate from "../Blankslate";
import Loading from "../Loading";
import { withAuthorization } from "../Session";
import {
  fetchRatesForCurrency,
  getAverageAmounts,
  getNextDueDate,
  getRemainingAmounts
} from "../utils";
import SubscriptionList from "./SubscriptionList";
import SubscriptionSummary from "./SubscriptionSummary";
import withSubscriptions from "./withSubscriptions";

class Subscriptions extends React.Component {
  state = {
    subscriptions: [],
    summary: null,
    mode: MODES.MONTH,
    orderBy: "dueDate",
    loading: true
  };

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.subscriptions.length !== this.props.subscriptions.length ||
      prevState.orderBy !== this.state.orderBy
    ) {
      this.processSubscriptions(this.props.subscriptions);
    }
  }

  async processSubscriptions(data) {
    const {
      authUser: { currency }
    } = this.props;
    const { orderBy } = this.state;
    const sortFns = {
      dueDate: (a, b) => a.dueDate - b.dueDate,
      name: (a, b) => a.name.localeCompare(b.name),
      amount: (a, b) => b.amount - a.amount
    };
    const rates = await fetchRatesForCurrency(currency);
    const subscriptions = data
      .map(sub => {
        const dueDate = getNextDueDate(sub.startsOn, sub.repeatMode);
        const amount = sub.amount / rates[sub.currency] || sub.amount;
        const averageAmounts = getAverageAmounts(amount, sub.repeatMode);
        const remainingAmounts = getRemainingAmounts(
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
      })
      .sort(sortFns[orderBy]);
    const summary = subscriptions.reduce(
      (acc, curr) => {
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
      },
      {
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
      }
    );

    this.setState({ subscriptions, summary, loading: false });
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
    const { subscriptions, summary, mode, orderBy, loading } = this.state;
    const {
      authUser: { currency, totalAs }
    } = this.props;

    if (loading) {
      return <Loading isCenter />;
    }

    return (
      <main>
        <header className="mb3">
          <div className="flex flex--between">
            <div>
              <h1 className="mb0">Subscriptions</h1>
              <Link to="/new">New subscription</Link>
            </div>
            <div className="form-input mb0 mt2">
              <label htmlFor="orderBy">Order by:</label>
              <select
                name="orderBy"
                id="orderBy"
                value={orderBy}
                onChange={event =>
                  this.setState({ orderBy: event.target.value })
                }
              >
                <option value="dueDate">Next due date</option>
                <option value="name">Name</option>
                <option value="amount">Amount</option>
              </select>
            </div>
          </div>
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
  withAuthorization(condition),
  withSubscriptions
)(Subscriptions);
