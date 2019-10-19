import React from "react";
import { withAuthUser } from "../Session";
import { formatAmountInCurrency, sumBy } from "../utils";

class SubscriptionSummary extends React.Component {
  state = {
    subscriptions: []
  };

  componentDidMount() {
    this.formatSubscriptions();
  }

  getConvertedAmount = (amount, currency) =>
    amount / this.props.rates[currency];

  formatSubscriptions = () => {
    const subscriptions = this.props.subscriptions.map(s => {
      let amountConverted = this.getConvertedAmount(s.amount, s.currency);
      let amountPerDay = 0;
      let amountPerWeek = 0;
      let amountPerMonth = 0;
      let amountPerYear = 0;

      if (s.repeatMode === "day") {
        amountPerDay = amountConverted;
        amountPerWeek = amountConverted * 7;
        amountPerMonth = amountConverted * 30;
        amountPerYear = amountConverted * 365;
      } else if (s.repeatMode === "week") {
        amountPerDay = amountConverted / 7;
        amountPerWeek = amountConverted;
        amountPerMonth = amountConverted * 4;
        amountPerYear = amountConverted * 52;
      } else if (s.repeatMode === "month") {
        amountPerDay = amountConverted / 30;
        amountPerWeek = amountConverted / 4;
        amountPerMonth = amountConverted;
        amountPerYear = amountConverted * 12;
      } else if (s.repeatMode === "year") {
        amountPerDay = amountConverted / 365;
        amountPerWeek = amountConverted / 52;
        amountPerMonth = amountConverted / 12;
        amountPerYear = amountConverted;
      }

      return {
        ...s,
        amountConverted,
        amountPerDay,
        amountPerWeek,
        amountPerMonth,
        amountPerYear
      };
    });

    this.setState({ subscriptions });
  };

  handleToggleMode = () => {
    this.props.onToggleMode();
  };

  render() {
    const mode =
      this.props.mode === "month" ? "amountPerMonth" : "amountPerYear";

    return (
      <div className="subscription-summary" onClick={this.handleToggleMode}>
        <div>
          <span className="subscription-item-title">Average Expenses</span>
          <span className="subscription-item-subtitle">
            Per {this.props.mode}
          </span>
        </div>
        <div className="tar">
          <span className="subscription-item-title">
            {formatAmountInCurrency(
              sumBy(this.state.subscriptions, mode),
              this.props.authUser.currency
            )}
          </span>
        </div>
      </div>
    );
  }
}

export default withAuthUser(SubscriptionSummary);
