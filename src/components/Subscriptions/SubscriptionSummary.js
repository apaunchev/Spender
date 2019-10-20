import React from "react";
import { withAuthUser } from "../Session";
import { formatAmountInCurrency, sumBy } from "../utils";

class SubscriptionSummary extends React.Component {
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
    const { mode, subscriptions, currency } = this.props;

    return (
      <div className="subscription-summary" onClick={this.handleToggleMode}>
        <div>
          <span className="subscription-item-title">Average Expenses</span>
          <span className="subscription-item-subtitle">Per {mode}</span>
        </div>
        <div className="tar">
          <span className="subscription-item-title">
            {formatAmountInCurrency(
              sumBy(subscriptions, this.getCurrentMode()),
              currency
            )}
          </span>
        </div>
      </div>
    );
  }
}

export default withAuthUser(SubscriptionSummary);
