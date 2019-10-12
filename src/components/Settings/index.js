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

    const { currency } = this.state;
    const { firebase, authUser } = this.props;

    firebase
      .user(authUser.uid)
      .set({ currency }, { merge: true })
      .then(() => (window.location.href = ROUTES.DASHBOARD));
  };

  render() {
    const { currency } = this.state;

    return (
      <main>
        <h1>Settings</h1>
        <form onSubmit={this.onSubmit}>
          <div>
            <label htmlFor="currency">Default currency</label>
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
          <div>
            <input type="submit" value="Save" />
          </div>
        </form>
      </main>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthUser,
  withAuthorization(condition)
)(Settings);
