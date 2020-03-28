import React from "react";
import { compose } from "recompose";
import { withFirebase } from "../Firebase";
import { withAuthUser } from "../Session";

function withSubscriptions(WrappedComponent) {
  return compose(
    withFirebase,
    withAuthUser
  )(
    class WithSubscriptions extends React.Component {
      state = {
        subscriptions: [],
        loading: true
      };

      componentDidMount() {
        const {
          firebase,
          authUser: { uid }
        } = this.props;

        firebase
          .subscriptions()
          .where("userId", "==", uid)
          .get()
          .then(snapshot => {
            if (snapshot.size) {
              let subscriptions = [];

              snapshot.forEach(doc =>
                subscriptions.push({ ...doc.data(), id: doc.id })
              );

              this.setState({
                subscriptions,
                loading: false
              });
            } else {
              this.setState({
                subscriptions: [],
                loading: false
              });
            }
          });
      }

      render() {
        const { subscriptions, loading } = this.state;

        return (
          <WrappedComponent
            subscriptions={subscriptions}
            loading={loading}
            {...this.props}
          />
        );
      }
    }
  );
}

export default withSubscriptions;
