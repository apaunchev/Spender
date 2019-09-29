import { format, getUnixTime, fromUnixTime, parseISO } from "date-fns";
import React, { Component } from "react";
import { compose } from "recompose";
import { DATE_FORMAT_ISO } from "../../constants/formats";
import { withFirebase } from "../Firebase";
import { withAuthUser } from "../Session/context";
import Loading from "../Loading";

class Expense extends Component {
  state = {
    loading: false,
    expense: {
      amount: "",
      categoryId: "",
      date: format(new Date(), DATE_FORMAT_ISO),
      payee: "",
      note: ""
    },
    categories: [],
    ...this.props.location.state
  };

  componentDidMount() {
    const {
      match: {
        params: { id }
      },
      firebase
    } = this.props;
    const { expense, categories } = this.state;

    if (!categories.length) {
      this.fetchCategories(expense.date);
    }

    if (id && !expense.amount) {
      this.setState({ loading: true });

      // read
      firebase
        .expense(id)
        .get()
        .then(doc => {
          if (doc.exists) {
            const { amount, categoryId, date, payee, note } = doc.data();

            this.setState({
              expense: {
                ...this.state.expense,
                amount,
                categoryId,
                date: format(fromUnixTime(date), DATE_FORMAT_ISO),
                payee,
                note
              }
            });
          }

          this.setState({ loading: false });
        })
        .catch(error => console.error(error));
    }
  }

  fetchCategories() {
    const { firebase, authUser } = this.props;

    this.setState({ loading: true });

    this.unsubscribeCategories = firebase
      .categories()
      .where("userId", "==", authUser.uid)
      .orderBy("name")
      .onSnapshot(snapshot => {
        if (snapshot.size) {
          let categories = [];
          snapshot.forEach(doc =>
            categories.push({ ...doc.data(), id: doc.id })
          );
          this.setState({ categories });
        } else {
          this.setState({ categories: [] });
        }

        this.setState({ loading: false });
      });
  }

  componentWillUnmount() {
    this.unsubscribe && this.unsubscribe();
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
      expense: { amount, categoryId, date, payee, note }
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
        categoryId,
        date: getUnixTime(parseISO(date)),
        payee,
        note,
        userId: authUser.uid
      });
    } else {
      // update
      firebase.expense(id).set(
        {
          amount: parseFloat(amount),
          categoryId,
          date: getUnixTime(parseISO(date)),
          payee,
          note
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
    const { loading, expense, categories } = this.state;

    if (loading) {
      return <Loading isCenter={true} />;
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
            />
          </div>
          <div className="form-input">
            <label htmlFor="category">Category</label>
            <select
              id="category"
              name="categoryId"
              value={expense.categoryId}
              onChange={this.onInputChange}
              required
            >
              <option value="" disabled hidden>
                Select a category...
              </option>
              {categories.map(({ id, name }) => (
                <option key={id} value={id}>
                  {name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-input">
            <label htmlFor="date">Date</label>
            <input
              type="date"
              id="date"
              name="date"
              value={expense.date}
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
            <label htmlFor="note">Note</label>
            <input
              type="text"
              id="note"
              name="note"
              placeholder="Purchased with debit card"
              value={expense.note}
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
