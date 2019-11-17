import React from "react";
import { formatAmountInCurrency } from "../utils";

class SubscriptionSummary extends React.Component {
  handleToggleMode = () => {
    this.props.onToggleMode();
  };

  render() {
    const { mode, summary, currency, totalAs } = this.props;

    return (
      <div className="subscription-summary" onClick={this.handleToggleMode}>
        {totalAs === "average" ? (
          <>
            <div>
              <span className="subscription-item-title">Average expenses</span>
              <span className="subscription-item-subtitle">Per {mode}</span>
            </div>
            <div className="tar">
              <span className="subscription-item-title">
                {formatAmountInCurrency(summary["average"][mode], currency)}
              </span>
            </div>
          </>
        ) : null}
        {totalAs === "remaining" ? (
          <>
            <div>
              <span className="subscription-item-title">
                Remaining expenses
              </span>
              <span className="subscription-item-subtitle">This {mode}</span>
            </div>
            <div className="tar">
              <span className="subscription-item-title">
                {formatAmountInCurrency(summary["remaining"][mode], currency)}
              </span>
            </div>
          </>
        ) : null}
      </div>
    );
  }
}

export default SubscriptionSummary;
