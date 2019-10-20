import React, { Component } from "react";
import CURRENCIES from "../../constants/currencies";
import * as ROUTES from "../../constants/routes";
import { withAuthUser, withAuthorization } from "../Session";
import { compose } from "recompose";
import Loading from "../Loading";

class Settings extends Component {
  state = {
    loading: false,
    user: {
      currency: "",
      orderBy: ""
    }
  };

  componentDidMount() {
    const { firebase, authUser } = this.props;

    this.setState({ loading: true });

    firebase
      .user(authUser.uid)
      .get()
      .then(doc => {
        if (doc.exists) {
          const { currency, orderBy } = doc.data();

          this.setState({
            user: { currency, orderBy },
            loading: false
          });
        } else {
          this.setState({ loading: false });
        }
      });
  }

  onInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({ user: { [name]: value } });
  };

  onSubmit = event => {
    event.preventDefault();

    const { firebase, authUser, history } = this.props;

    firebase
      .user(authUser.uid)
      .set({ ...this.state.user }, { merge: true })
      .then(() => history.push(ROUTES.SUBSCRIPTIONS));
  };

  onSignOut = event => {
    event.preventDefault();

    this.props.firebase.doSignOut();
  };

  render() {
    const {
      loading,
      user: { currency, orderBy }
    } = this.state;

    if (loading) {
      return <Loading isCenter />;
    }

    return (
      <main>
        <h1>Settings</h1>
        <form className="form" onSubmit={this.onSubmit}>
          <div className="form-input">
            <label htmlFor="currency">Base currency</label>
            <select
              name="currency"
              id="currency"
              value={currency}
              onChange={this.onInputChange}
            >
              {CURRENCIES.map((c, idx) => (
                <option key={`${c}-${idx}`} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="form-input">
            <label htmlFor="orderBy">Order subscriptions by</label>
            <select
              name="orderBy"
              id="orderBy"
              value={orderBy}
              onChange={this.onInputChange}
            >
              <option value="name|asc">Name</option>
              <option value="amount|desc">Highest to lowest amount</option>
              <option value="amount|asc">Lowest to highest amount</option>
            </select>
          </div>
          <div className="form-input">
            <input
              type="submit"
              className="button button--primary"
              value="Save"
            />
          </div>
        </form>
        <p>
          <a className="danger" href="/" onClick={this.onSignOut}>
            Sign out
          </a>
        </p>
      </main>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthUser,
  withAuthorization(condition)
)(Settings);
