import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import * as ROUTES from "../../constants/routes";
import { withFirebase } from "../Firebase";

class SignInGoogle extends Component {
  constructor(props) {
    super(props);

    this.state = { error: null };
  }

  onSubmit = event => {
    event.preventDefault();

    this.props.firebase
      .doSignInWithGoogle()
      .then(authUser => {
        this.props.firebase.user(authUser.user.uid).set(
          {
            username: authUser.user.displayName,
            email: authUser.user.email
          },
          { merge: true }
        );
        this.setState({ error: null });
        this.props.history.push(ROUTES.EXPENSES);
      })
      .catch(error => {
        this.setState({ error });
      });
  };

  render() {
    const { error } = this.state;

    return (
      <form onSubmit={this.onSubmit}>
        <p>
          <button type="submit" className="button button--primary">
            Sign in with Google
          </button>
        </p>

        {error && <p className="error">{error.message}</p>}
      </form>
    );
  }
}

export default compose(
  withRouter,
  withFirebase
)(SignInGoogle);
