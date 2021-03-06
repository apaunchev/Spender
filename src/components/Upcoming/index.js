import { format, parseISO, isSameMonth, addMonths } from "date-fns";
import React from "react";
import { compose } from "recompose";
import Loading from "../Loading";
import { withAuthorization } from "../Session";
import { SubscriptionList } from "../Subscriptions";
import withSubscriptions from "../Subscriptions/withSubscriptions";
import {
  fetchRatesForCurrency,
  formatAmountInCurrency,
  getNextDueDate,
  getRemainingDueDatesForYear,
  sumBy
} from "../utils";

class Upcoming extends React.Component {
  state = {
    upcoming: [],
    loading: true
  };

  componentDidUpdate(prevProps) {
    if (this.props.subscriptions.length !== prevProps.subscriptions.length) {
      this.processSubscriptions(this.props.subscriptions);
    }
  }

  async processSubscriptions(data) {
    const now = new Date();
    const rates = await fetchRatesForCurrency(this.props.authUser.currency);
    const subscriptions = data.map(sub => {
      const dueDate = getNextDueDate(sub.startsOn, sub.repeatMode);
      const amount = sub.amount / rates[sub.currency] || sub.amount;
      const remainingDueDates = getRemainingDueDatesForYear(
        dueDate,
        sub.repeatMode
      );

      return { ...sub, dueDate, amount, remainingDueDates };
    });
    const upcoming = new Array(12).fill([]).map((_, index) => {
      const currentMonth = addMonths(now, index).setDate(1);
      const currentMonthSubs = subscriptions
        .filter(s =>
          s.remainingDueDates.find(d => isSameMonth(d, currentMonth))
        )
        .map(s => ({
          ...s,
          dueDate: s.remainingDueDates.find(d => isSameMonth(d, currentMonth))
        }))
        .sort((a, b) => a.dueDate - b.dueDate);

      return {
        id: format(currentMonth, "yyyy-MM-dd"),
        subscriptions: currentMonthSubs,
        totalAmount: sumBy(currentMonthSubs, "amount")
      };
    });

    this.setState({ upcoming, loading: false });
  }

  render() {
    const { upcoming, loading } = this.state;
    const maxAmount = upcoming.length
      ? Math.max(...upcoming.map(m => m.totalAmount))
      : 0;
    const currency = this.props.authUser.currency;

    if (loading) {
      return <Loading isCenter />;
    }

    return (
      <main>
        <header className="mb3">
          <h1 className="mb0">Upcoming</h1>
        </header>
        <div className="chart mb3">
          <ol className="chart__list scroll">
            {upcoming.map(({ id, totalAmount }) => (
              <li className="chart__item" key={id}>
                <a
                  href={`#${id}`}
                  title={formatAmountInCurrency(totalAmount, currency)}
                >
                  <span className="chart__item__bar">
                    <span
                      className="chart__item__bar__segment"
                      style={{
                        height: `${(totalAmount / maxAmount) * 100}px`
                      }}
                    ></span>
                  </span>
                  <span className="chart__item__label">
                    {format(parseISO(id), "MMM")}
                  </span>
                </a>
              </li>
            ))}
          </ol>
        </div>
        {upcoming.map(({ id, subscriptions, totalAmount }) =>
          subscriptions.length ? (
            <div key={id}>
              <header className="flex flex--between">
                <h2 id={id} className="mb0">
                  {format(parseISO(id), "MMMM yyyy")}
                </h2>
                <span className="subscription-item-title">
                  {formatAmountInCurrency(totalAmount, currency)}
                </span>
              </header>
              <SubscriptionList
                subscriptions={subscriptions}
                currency={this.props.authUser.currency}
              />
            </div>
          ) : null
        )}
      </main>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
  withSubscriptions
)(Upcoming);
