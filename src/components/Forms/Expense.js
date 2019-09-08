import {
  endOfMonth,
  fromUnixTime,
  getMonth,
  getUnixTime,
  getYear,
  isWithinInterval,
  parseISO,
  startOfMonth
} from "date-fns";
import { chain } from "lodash";
import React, { Component } from "react";
import { compose } from "recompose";
import withBudgets from "../Budgets/withBudgets";
import { withFirebase } from "../Firebase";
import { AuthUserContext } from "../Session";
import { toDateInputValue } from "../utils";

const INITIAL_STATE = {
  amount: "",
  budgetId: "",
  date: getUnixTime(new Date()),
  payee: "",
  notes: ""
};

class Expense extends Component {
  state = {
    loading: false,
    expense: null,
    ...this.props.location.state
  };

  componentDidMount() {
    const {
      match: {
        params: { id }
      },
      firebase
    } = this.props;
    const { expense } = this.state;

    if (!id) {
      this.setState({ ...this.state, expense: INITIAL_STATE });
    }

    if (id && !expense) {
      this.setState({ loading: true });

      // read
      firebase
        .expense(id)
        .get()
        .then(doc => {
          if (doc.exists) {
            const { amount, budgetId, date, payee, notes } = doc.data();
            this.setState({
              expense: {
                amount,
                budgetId,
                date,
                payee,
                notes
              }
            });
          }

          this.setState({ loading: false });
        })
        .catch(error => console.error(error));
    }
  }

  onInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      expense: {
        ...this.state.expense,
        [name]: value
      }
    });
  };

  onSubmit = event => {
    event.preventDefault();

    const {
      expense: { amount, budgetId, date, payee, notes }
    } = this.state;
    const {
      match: {
        params: { id }
      },
      history,
      firebase
    } = this.props;
    const authUser = this.context;

    if (!id) {
      // create
      firebase.expenses().add({
        amount: parseFloat(amount),
        budgetId,
        date,
        payee,
        notes,
        userId: authUser.uid
      });
    } else {
      // update
      firebase.expense(id).set(
        {
          amount: parseFloat(amount),
          budgetId,
          date,
          payee,
          notes
        },
        { merge: true }
      );
    }

    history.push("/expenses");
  };

  onDelete = (event, id) => {
    event.preventDefault();

    const { firebase, history } = this.props;

    if (window.confirm("Are you sure you want to delete this expense?")) {
      // delete
      firebase.expense(id).delete();
    }

    history.push("/expenses");
  };

  render() {
    const {
      match: {
        params: { id }
      },
      budgets
    } = this.props;
    const { loading } = this.state;

    if (loading || !budgets.length) {
      return null;
    }

    const { expense } = this.state;
    const formattedBudgets = chain(budgets)
      .filter(b =>
        isWithinInterval(fromUnixTime(b.date), {
          start: startOfMonth(fromUnixTime(expense.date)),
          end: endOfMonth(fromUnixTime(expense.date))
        })
      )
      .sortBy(b => b.name)
      .value();

    return (
      <main>
        <h1>{!id ? "New" : "Edit"} expense</h1>
        <form className="form" onSubmit={this.onSubmit}>
          <div className="form-input">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              min="0"
              step="0.01"
              placeholder="19.90"
              value={expense.amount}
              onChange={this.onInputChange}
              required
              autoFocus
            />
          </div>
          <div className="form-input">
            <label htmlFor="budget">Budget</label>
            <select
              id="budgetId"
              name="budgetId"
              value={expense.budgetId}
              onChange={this.onInputChange}
              required
            >
              <option value="" disabled hidden>
                Select a budget...
              </option>
              {formattedBudgets.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            {!formattedBudgets.length ? (
              <p className="danger mt2 mb0">
                You have no budgets for the selected month.{" "}
                <a
                  href={`/new/budget/${getYear(
                    parseISO(expense.date)
                  )}/${getMonth(parseISO(expense.date))}`}
                >
                  Create one?
                </a>
              </p>
            ) : null}
          </div>
          <div className="form-input">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={toDateInputValue(fromUnixTime(expense.date))}
              onChange={this.onInputChange}
              required
            />
          </div>
          <div className="form-input">
            <label htmlFor="payee">Payee</label>
            <input
              type="text"
              id="payee"
              name="payee"
              placeholder="Amazon"
              value={expense.payee}
              onChange={this.onInputChange}
            />
          </div>
          <div className="form-input">
            <label htmlFor="notes">Notes</label>
            <input
              type="text"
              id="notes"
              name="notes"
              placeholder="Purchased with debit card"
              value={expense.notes}
              onChange={this.onInputChange}
            />
          </div>
          <div className="form-input">
            <input
              type="submit"
              className="button button--primary"
              value="Save"
            />
          </div>
          {id && (
            <p className="danger">
              <a href="/" onClick={e => this.onDelete(e, id)}>
                Delete
              </a>
            </p>
          )}
        </form>
      </main>
    );
  }
}

Expense.contextType = AuthUserContext;

export default compose(
  withFirebase,
  withBudgets
)(Expense);
