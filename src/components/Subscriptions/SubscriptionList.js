import React from "react";
import SubscriptionItem from "./SubscriptionItem";

const SubscriptionList = ({ subscriptions }) => (
  <ol className="subscription-list">
    {subscriptions.map(subscription => (
      <SubscriptionItem key={subscription.id} subscription={subscription} />
    ))}
  </ol>
);

export default SubscriptionList;
