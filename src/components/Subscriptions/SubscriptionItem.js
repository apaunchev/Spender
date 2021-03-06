import { formatDistanceStrict } from "date-fns";
import React from "react";
import { Link } from "react-router-dom";
import { formatAmountInCurrency } from "../utils";

const SubscriptionItem = ({
  subscription: { id, amount, name, description, color, dueDate },
  currency
}) => (
  <li>
    <Link
      to={`/subscription/${id}`}
      className="subscription-item"
      style={{ backgroundColor: color }}
    >
      <div>
        <span className="subscription-item-title">{name}</span>
        {description && (
          <span className="subscription-item-subtitle">{description}</span>
        )}
      </div>
      <div className="tar">
        <span className="subscription-item-title">
          {formatAmountInCurrency(amount, currency)}
        </span>
        {dueDate && (
          <span className="subscription-item-subtitle" title={dueDate}>
            {formatDistanceStrict(dueDate, new Date(), { addSuffix: true })}
          </span>
        )}
      </div>
    </Link>
  </li>
);

export default SubscriptionItem;
