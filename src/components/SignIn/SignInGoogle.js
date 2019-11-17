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

  onSubmit = () => {
    const { firebase, history } = this.props;

    firebase
      .doSignInWithGoogle()
      .then(authUser => {
        firebase.user(authUser.user.uid).set(
          {
            username: authUser.user.displayName,
            email: authUser.user.email,
            signedInAt: firebase.fieldValue.serverTimestamp()
          },
          { merge: true }
        );

        this.setState({ error: null });

        history.push(ROUTES.SUBSCRIPTIONS);
      })
      .catch(error => this.setState({ error }));
  };

  render() {
    const { error } = this.state;

    return (
      <>
        <button className="button button--primary" onClick={this.onSubmit}>
          Sign in with Google
        </button>

        {error && <p className="error">{error.message}</p>}
      </>
    );
  }
}

export default compose(withRouter, withFirebase)(SignInGoogle);
