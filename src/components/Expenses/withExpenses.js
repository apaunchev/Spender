import React from "react";
import { withFirebase } from "../Firebase";
import { AuthUserContext } from "../Session";

const withExpenses = Component => {
  class WithExpenses extends React.Component {
    state = {
      expenses: [],
      loading: false
    };

    componentDidMount() {
      this.props.firebase
        .expenses()
        .where("userId", "==", this.context.uid)
        .get()
        .then(snapshot => {
          if (snapshot.size) {
            let expenses = [];
            snapshot.forEach(doc =>
              expenses.push({ ...doc.data(), id: doc.id })
            );
            this.setState({ expenses, loading: false });
          } else {
            this.setState({ expenses: [], loading: false });
          }
        })
        .catch(error => console.error(error));
    }

    render() {
      return <Component expenses={this.state.expenses} {...this.props} />;
    }
  }

  WithExpenses.contextType = AuthUserContext;

  return withFirebase(WithExpenses);
};

export default withExpenses;
