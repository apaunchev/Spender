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
      let amountPerWeek = 0;
      let amountPerMonth = 0;
      let amountPerYear = 0;

      if (s.repeatMode === "week") {
        amountPerWeek = amountConverted;
        amountPerMonth = amountConverted * 4;
        amountPerYear = amountConverted * 52;
      } else if (s.repeatMode === "month") {
        amountPerWeek = amountConverted / 4;
        amountPerMonth = amountConverted;
        amountPerYear = amountConverted * 12;
      } else if (s.repeatMode === "year") {
        amountPerWeek = amountConverted / 52;
        amountPerMonth = amountConverted / 12;
        amountPerYear = amountConverted;
      }

      return {
        ...s,
        amountConverted,
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

  getCurrentMode = () => {
    const { mode } = this.props;

    if (mode === "week") {
      return "amountPerWeek";
    } else if (mode === "month") {
      return "amountPerMonth";
    } else if (mode === "year") {
      return "amountPerYear";
    }
  };

  render() {
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
              sumBy(this.state.subscriptions, this.getCurrentMode()),
              this.props.authUser.currency
            )}
          </span>
        </div>
      </div>
    );
  }
}

export default withAuthUser(SubscriptionSummary);
