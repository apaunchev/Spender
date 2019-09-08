import { fromUnixTime, getUnixTime } from "date-fns";
import React, { Component } from "react";
import { CirclePicker } from "react-color";
import BUDGET_NAMES from "../../constants/budgets";
import { withFirebase } from "../Firebase";
import MonthNav from "../MonthNav";
import { AuthUserContext } from "../Session";
import { renderDatalistFromArray } from "../utils";

const INITIAL_STATE = {
  name: "",
  amount: "",
  color: "#000000"
};

class Budget extends Component {
  state = {
    loading: false,
    budget: null,
    currentDate: new Date(),
    ...this.props.location.state
  };

  componentDidMount() {
    const {
      match: {
        params: { id, year, month }
      },
      firebase
    } = this.props;
    const { budget } = this.state;

    if (!id) {
      this.setState({ ...this.state, budget: INITIAL_STATE });
    }

    if (id && !budget) {
      this.setState({ loading: true });

      // read
      firebase
        .budget(id)
        .get()
        .then(doc => {
          if (doc.exists) {
            const { name, date, amount, color } = doc.data();
            this.setState({
              currentDate: fromUnixTime(date),
              budget: {
                name,
                amount,
                color
              }
            });
          }

          this.setState({ loading: false });
        })
        .catch(error => console.error(error));
    }

    if (year && month) {
      this.setState({ currentDate: new Date(year, month, 1) });
    }
  }

  setCurrentDate = currentDate => {
    this.setState({ currentDate });
  };

  onInputChange = event => {
    const target = event.target;
    const value = target.type === "checkbox" ? target.checked : target.value;
    const name = target.name;

    this.setState({
      budget: {
        ...this.state.budget,
        [name]: value
      }
    });
  };

  onSubmit = event => {
    event.preventDefault();

    const {
      currentDate,
      budget: { name, amount, color }
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
      firebase.budgets().add({
        name,
        date: getUnixTime(currentDate),
        amount: parseFloat(amount),
        color,
        userId: authUser.uid
      });
    } else {
      // update
      firebase.budget(id).set(
        {
          name,
          date: getUnixTime(currentDate),
          amount: parseFloat(amount),
          color
        },
        { merge: true }
      );
    }

    history.push("/budgets");
  };

  onDelete = (event, id) => {
    event.preventDefault();

    const { firebase, history } = this.props;

    if (window.confirm("Are you sure you want to delete this budget?")) {
      // delete
      firebase.budget(id).delete();
    }

    history.push("/budgets");
  };

  render() {
    const {
      match: {
        params: { id }
      }
    } = this.props;
    const { loading, currentDate, budget } = this.state;

    if (loading || !budget) {
      return null;
    }

    return (
      <main>
        <header className="mb3 flex flex--between">
          <h1 className="mb0">{!id ? "New" : "Edit"} budget</h1>
          <MonthNav
            currentDate={currentDate}
            setCurrentDate={this.setCurrentDate}
          />
        </header>
        <form className="form" onSubmit={this.onSubmit}>
          <div className="form-input">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              list="budgets"
              placeholder="Groceries"
              value={budget.name}
              onChange={this.onInputChange}
              required
              autoFocus
            />
          </div>
          <div className="form-input">
            <label htmlFor="amount">Amount</label>
            <input
              type="number"
              id="amount"
              name="amount"
              min="0"
              step="0.01"
              placeholder="200"
              value={budget.amount}
              onChange={this.onInputChange}
              required
            />
          </div>
          <div className="form-input">
            <label htmlFor="color">Color</label>
            <CirclePicker
              name="color"
              color={budget.color}
              onChangeComplete={color =>
                this.setState({
                  budget: { ...this.state.budget, color: color.hex }
                })
              }
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
        {renderDatalistFromArray(BUDGET_NAMES, "budgets")}
      </main>
    );
  }
}

Budget.contextType = AuthUserContext;

export default withFirebase(Budget);
