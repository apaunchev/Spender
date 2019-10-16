import axios from "axios";
import React from "react";
import Loading from "../Loading";
import { withAuthUser } from "../Session";
import { formatAmountInCurrency, groupBy, sumBy } from "../utils";

class SubscriptionSummary extends React.Component {
  state = {
    loading: false,
    rates: [],
    baseCurrency: this.props.authUser.currency || "EUR"
  };

  componentDidMount() {
    this.setState({ loading: true });

    axios
      .get(`https://api.openrates.io/latest?base=${this.state.baseCurrency}`)
      .then(res => this.setState({ rates: res.data.rates, loading: false }));
  }

  getConvertedAmount(amount, currency) {
    return amount / this.state.rates[currency];
  }

  render() {
    const filtered = this.props.subscriptions.filter(s => s.isActive);
    const grouped = groupBy(filtered, "currency");
    const groups = Object.keys(grouped).map(currency => {
      const group = grouped[currency];
      const baseTotal = sumBy(group, "amount");

      return {
        count: group.length,
        currency,
        baseTotal,
        convertedTotal: this.getConvertedAmount(baseTotal, currency)
      };
    });

    if (this.state.loading) {
      return <Loading />;
    }

    return (
      <>
        <ul>
          {groups.map(({ count, currency, baseTotal, convertedTotal }) => (
            <li key={currency}>
              {currency} / {count} subscriptions /{" "}
              {formatAmountInCurrency(baseTotal, currency)} /{" "}
              {formatAmountInCurrency(
                convertedTotal,
                this.props.authUser.currency
              )}
            </li>
          ))}
        </ul>
      </>
    );
  }
}

export default withAuthUser(SubscriptionSummary);
