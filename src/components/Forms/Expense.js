import {
  fromUnixTime,
  getMonth,
  getUnixTime,
  getYear,
  parseISO
} from "date-fns";
import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import { toDateInputValue } from "../utils";
import { compose } from "recompose";
import { withAuthUser } from "../Session/context";

class Expense extends Component {
  state = {
    loading: false,
    expense: {
      amount: "",
      budgetId: "",
      date: getUnixTime(new Date()),
      payee: "",
      notes: ""
    },
    budgets: [],
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

  onDateChange = event => {
    this.setState({
      expense: {
        ...this.state.expense,
        date: getUnixTime(parseISO(event.target.value))
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
      firebase,
      authUser
    } = this.props;

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
      }
    } = this.props;
    const { loading, expense, budgets } = this.state;

    if (loading) {
      return null;
    }

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
              {budgets.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
            {!budgets.length ? (
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
              onChange={this.onDateChange}
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

export default compose(
  withFirebase,
  withAuthUser
)(Expense);
