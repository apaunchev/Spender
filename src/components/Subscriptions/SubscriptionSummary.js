import React from "react";
import { withAuthUser } from "../Session";
import { formatAmountInCurrency } from "../utils";

class SubscriptionSummary extends React.Component {
  handleToggleMode = () => {
    this.props.onToggleMode();
  };

  render() {
    const { mode, averages, currency } = this.props;

    return (
      <div className="subscription-summary" onClick={this.handleToggleMode}>
        <div>
          <span className="subscription-item-title">Average Expenses</span>
          <span className="subscription-item-subtitle">Per {mode}</span>
        </div>
        <div className="tar">
          <span className="subscription-item-title">
            {formatAmountInCurrency(averages[mode], currency)}
          </span>
        </div>
      </div>
    );
  }
}

export default withAuthUser(SubscriptionSummary);
