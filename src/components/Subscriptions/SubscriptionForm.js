import React from "react";
import { CirclePicker } from "react-color";
import { compose } from "recompose";
import CURRENCIES from "../../constants/currencies";
import * as ROUTES from "../../constants/routes";
import { withFirebase } from "../Firebase";
import Loading from "../Loading";
import { withAuthorization, withAuthUser } from "../Session";

class SubscriptionForm extends React.Component {
  state = {
    loading: false,
    subscription: {
      amount: "",
      currency: "EUR",
      name: "",
      description: "",
      color: "#000",
      startsOn: "",
      endsOn: "",
      repeatMode: "month"
    },
    ...this.props.location.state
  };

  componentDidMount() {
    const {
      match: {
        params: { id }
      },
      firebase
    } = this.props;

    if (id) {
      this.setState({ loading: true });

      // read
      firebase
        .subscription(id)
        .get()
        .then(doc => {
          if (doc.exists) {
            const {
              amount,
              currency,
              name,
              description,
              color,
              startsOn,
              endsOn,
              repeatMode
            } = doc.data();

            this.setState({
              subscription: {
                ...this.state.subscription,
                amount,
                currency,
                name,
                description,
                color,
                startsOn,
                endsOn,
                repeatMode
              },
              loading: false
            });
          }
        })
        .catch(error => console.error(error));
    }
  }

  handleInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      subscription: {
        ...this.state.subscription,
        [name]: value
      }
    });
  };

  handleSubmit = event => {
    event.preventDefault();

    const {
      subscription: {
        amount,
        currency,
        name,
        description,
        color,
        startsOn,
        endsOn,
        repeatMode
      }
    } = this.state;
    const {
      match: {
        params: { id }
      },
      history,
      firebase,
      authUser
    } = this.props;

    if (!id) {
      // create
      firebase.subscriptions().add({
        amount: parseFloat(amount),
        currency,
        name,
        description,
        color,
        startsOn,
        endsOn,
        repeatMode,
        createdAt: firebase.fieldValue.serverTimestamp(),
        userId: authUser.uid
      });
    } else {
      // update
      firebase.subscription(id).set(
        {
          amount: parseFloat(amount),
          currency,
          name,
          description,
          color,
          startsOn,
          endsOn,
          repeatMode,
          modifiedAt: firebase.fieldValue.serverTimestamp()
        },
        { merge: true }
      );
    }

    history.push(ROUTES.SUBSCRIPTIONS);
  };

  handleDelete = (event, id) => {
    event.preventDefault();

    const { firebase, history } = this.props;

    // delete
    if (window.confirm("Are you sure you want to delete this subscription?")) {
      firebase.subscription(id).delete();
      history.push(ROUTES.SUBSCRIPTIONS);
    }
  };

  render() {
    const {
      loading,
      subscription: {
        amount,
        currency,
        name,
        description,
        color,
        startsOn,
        endsOn,
        repeatMode
      }
    } = this.state;
    const {
      match: {
        params: { id }
      }
    } = this.props;

    if (loading) {
      return <Loading isCenter />;
    }

    return (
      <main>
        <header className="mb3">
          <h1>{!id ? "New" : "Edit"} subscription</h1>
        </header>
        <form className="form" onSubmit={this.handleSubmit}>
          <div className="form-input">
            <div className="grid" data-columns="2">
              <div>
                <label htmlFor="amount">Amount</label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="9.99"
                  value={amount}
                  onChange={this.handleInputChange}
                  required
                />
              </div>
              <div>
                <label htmlFor="currency">Currency</label>
                <select
                  name="currency"
                  id="currency"
                  value={currency}
                  onChange={this.handleInputChange}
                >
                  {CURRENCIES.map((c, idx) => (
                    <option key={`${c}-${idx}`} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <div className="form-input">
            <label htmlFor="name">Name</label>
            <input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={this.handleInputChange}
              required
            />
          </div>
          <div className="form-input">
            <label htmlFor="description">Description</label>
            <input
              id="description"
              name="description"
              type="text"
              value={description}
              onChange={this.handleInputChange}
            />
          </div>
          <div className="form-input">
            <label htmlFor="color">Color</label>
            <CirclePicker
              id="color"
              name="color"
              color={color}
              onChangeComplete={color =>
                this.setState({
                  subscription: { ...this.state.subscription, color: color.hex }
                })
              }
            />
          </div>
          <div className="form-input">
            <label htmlFor="startsOn">Starts on</label>
            <input
              id="startsOn"
              name="startsOn"
              type="date"
              value={startsOn}
              onChange={this.handleInputChange}
            />
          </div>
          <div className="form-input">
            <label htmlFor="endsOn">Ends on</label>
            <input
              id="endsOn"
              name="endsOn"
              type="date"
              value={endsOn}
              onChange={this.handleInputChange}
            />
          </div>
          <div className="form-input">
            <label htmlFor="repeatMode">Repeats every</label>
            <select
              id="repeatMode"
              name="repeatMode"
              value={repeatMode}
              onChange={this.handleInputChange}
            >
              <option key="week" value="week">
                Week
              </option>
              <option key="month" value="month">
                Month
              </option>
              <option key="year" value="year">
                Year
              </option>
            </select>
          </div>
          <div className="form-input">
            <input type="submit" value="Save" />
          </div>
          {id && (
            <p>
              <a
                className="danger"
                href="/"
                onClick={e => this.handleDelete(e, id)}
              >
                Delete subscription
              </a>
            </p>
          )}
        </form>
      </main>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withFirebase,
  withAuthUser,
  withAuthorization(condition)
)(SubscriptionForm);
