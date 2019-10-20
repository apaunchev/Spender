import React from "react";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import Blankslate from "../Blankslate";
import Loading from "../Loading";
import { withAuthorization, withAuthUser } from "../Session";
import SubscriptionList from "./SubscriptionList";
import SubscriptionSummary from "./SubscriptionSummary";

class Subscriptions extends React.Component {
  state = {
    subscriptions: [],
    currency: "",
    loading: false,
    mode: "month"
  };

  componentDidMount() {
    this.onListenForData();
  }

  async fetchRates(currency) {
    const response = await fetch(
      `https://api.openrates.io/latest?base=${currency}`
    );
    const json = await response.json();

    return json.rates;
  }

  onListenForData() {
    const { firebase, authUser } = this.props;

    this.setState({ loading: true });

    firebase
      .user(authUser.uid)
      .get()
      .then(async doc => {
        if (doc.exists) {
          const { currency, orderBy } = doc.data();
          const [field, direction] = orderBy.split("|");
          const rates = await this.fetchRates(currency);
          const mapFn = subscription => {
            const amountConverted =
              subscription.amount / rates[subscription.currency] ||
              subscription.amount;
            let amountPerWeek = 0;
            let amountPerMonth = 0;
            let amountPerYear = 0;

            if (subscription.repeatMode === "week") {
              amountPerWeek = amountConverted;
              amountPerMonth = amountConverted * 4;
              amountPerYear = amountConverted * 52;
            } else if (subscription.repeatMode === "month") {
              amountPerWeek = amountConverted / 4;
              amountPerMonth = amountConverted;
              amountPerYear = amountConverted * 12;
            } else if (subscription.repeatMode === "year") {
              amountPerWeek = amountConverted / 52;
              amountPerMonth = amountConverted / 12;
              amountPerYear = amountConverted;
            }

            return {
              ...subscription,
              amountPerWeek,
              amountPerMonth,
              amountPerYear,
              dueDate: null
            };
          };

          firebase
            .subscriptions()
            .where("userId", "==", authUser.uid)
            .orderBy(field, direction)
            .get()
            .then(snapshot => {
              if (snapshot.size) {
                let subscriptions = [];

                snapshot.forEach(doc =>
                  subscriptions.push({ ...doc.data(), id: doc.id })
                );

                subscriptions = subscriptions.map(mapFn);

                this.setState({ subscriptions, currency, loading: false });
              } else {
                this.setState({
                  subscriptions: [],
                  currency: "",
                  loading: false
                });
              }
            });
        }
      });
  }

  toggleMode = () => {
    const current = this.state.mode;

    if (current === "month") {
      this.setState({ mode: "year" });
    } else if (current === "year") {
      this.setState({ mode: "week" });
    } else if (current === "week") {
      this.setState({ mode: "month" });
    }
  };

  render() {
    const { loading, subscriptions, currency, mode } = this.state;

    if (loading) {
      return <Loading isCenter />;
    }

    return (
      <main>
        <header className="mb3">
          <h1 className="mb0">Subscriptions</h1>
          <Link to="/new">New subscription</Link>
        </header>
        {subscriptions.length ? (
          <>
            <SubscriptionList subscriptions={subscriptions} />
            <SubscriptionSummary
              subscriptions={subscriptions}
              currency={currency}
              mode={mode}
              onToggleMode={this.toggleMode}
            />
          </>
        ) : (
          <Blankslate
            title="Nothing to show"
            description="Looks like you have not added any subscriptions yet."
          />
        )}
      </main>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthUser,
  withAuthorization(condition)
)(Subscriptions);
