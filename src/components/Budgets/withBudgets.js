import React from "react";
import { withFirebase } from "../Firebase";
import { AuthUserContext } from "../Session";

const withBudgets = Component => {
  class WithBudgets extends React.Component {
    state = {
      budgets: [],
      loading: false
    };

    componentDidMount() {
      this.props.firebase
        .budgets()
        .where("userId", "==", this.context.uid)
        .get()
        .then(snapshot => {
          if (snapshot.size) {
            let budgets = [];
            snapshot.forEach(doc =>
              budgets.push({ ...doc.data(), id: doc.id })
            );
            this.setState({ budgets, loading: false });
          } else {
            this.setState({ budgets: [], loading: false });
          }
        })
        .catch(error => console.error(error));
    }

    render() {
      return <Component budgets={this.state.budgets} {...this.props} />;
    }
  }

  WithBudgets.contextType = AuthUserContext;

  return withFirebase(WithBudgets);
};

export default withBudgets;
