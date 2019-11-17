import React from "react";
import SubscriptionItem from "./SubscriptionItem";

const SubscriptionList = ({ subscriptions, currency }) => (
  <ol className="subscription-list">
    {subscriptions.map(subscription => (
      <SubscriptionItem
        key={subscription.id}
        subscription={subscription}
        currency={currency}
      />
    ))}
  </ol>
);

export default SubscriptionList;
