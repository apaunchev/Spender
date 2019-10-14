import React, { Component } from "react";
import CURRENCIES from "../../constants/currencies";
import * as ROUTES from "../../constants/routes";
import { withAuthUser, withAuthorization } from "../Session";
import { compose } from "recompose";

class Settings extends Component {
  state = {
    currency: this.props.authUser.currency || "EUR"
  };

  onInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  };

  onSubmit = event => {
    event.preventDefault();

    this.props.firebase
      .user(this.props.authUser.uid)
      .set({ currency: this.state.currency }, { merge: true })
      .then(() => (window.location.href = ROUTES.SUBSCRIPTIONS));
  };

  onSignOut = event => {
    event.preventDefault();

    this.props.firebase.doSignOut();
  };

  render() {
    const { currency } = this.state;

    return (
      <main>
        <h1>Settings</h1>
        <form className="form" onSubmit={this.onSubmit}>
          <div className="form-input">
            <label htmlFor="currency">Default currency</label>
            <p className="mb2">
              <small>
                Controls the currency sign used for new subscriptions.
              </small>
            </p>
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
