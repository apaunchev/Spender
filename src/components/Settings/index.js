import React, { Component } from "react";
import CURRENCIES from "../../constants/currencies";
import * as ROUTES from "../../constants/routes";
import { AuthUserContext, withAuthorization } from "../Session";

class Settings extends Component {
  state = {
    currency: this.context.currency || "EUR"
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

    const { currency } = this.state;
    const { firebase } = this.props;

    firebase
      .user(this.context.uid)
      .set({ currency }, { merge: true })
      .then(() => (window.location.href = ROUTES.DASHBOARD));
  };

  render() {
    const { currency } = this.state;

    return (
      <main>
        <h1>Settings</h1>
        <form className="form" onSubmit={this.onSubmit}>
          <div className="form-input">
            <label htmlFor="currency">Currency</label>
            <p className="mb2">
              <small>Controls the currency sign used across the app.</small>
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
      </main>
    );
  }
}

Settings.contextType = AuthUserContext;

const condition = authUser => !!authUser;

export default withAuthorization(condition)(Settings);
