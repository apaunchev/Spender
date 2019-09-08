import {
  endOfMonth,
  getMonth,
  getUnixTime,
  getYear,
  startOfMonth
} from "date-fns";
import { chain } from "lodash";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import Blankslate from "../../components/Blankslate";
import MonthNav from "../MonthNav";
import { withAuthorization } from "../Session";
import { withAuthUser } from "../Session/context";
import {
  formatAmountInCurrency,
  formatAmountInPercent,
  getTotalAmountFromArray
} from "../utils";

class Budgets extends Component {
  state = {
    loadingExpenses: false,
    loadingBudgets: false,
    currentDate: new Date(),
    expenses: [],
    budgets: []
  };

  componentDidMount() {
    const { currentDate } = this.state;

    this.fetchExpenses(currentDate);
    this.fetchBudgets(currentDate);
  }

  fetchExpenses(currentDate) {
    const { firebase, authUser } = this.props;

    this.setState({ loadingExpenses: true });

    return firebase
      .expenses()
      .where("userId", "==", authUser.uid)
      .where("date", ">=", getUnixTime(startOfMonth(currentDate)))
      .where("date", "<=", getUnixTime(endOfMonth(currentDate)))
      .get()
      .then(snapshot => {
        if (snapshot.size) {
          let expenses = [];
          snapshot.forEach(doc => expenses.push({ ...doc.data(), id: doc.id }));
          this.setState({ expenses });
        } else {
          this.setState({ expenses: [] });
        }

        this.setState({ loadingExpenses: false });
      })
      .catch(error => console.error(error));
  }

  fetchBudgets(currentDate) {
    const { firebase, authUser } = this.props;

    this.setState({ loadingBudgets: true });

    return firebase
      .budgets()
      .where("userId", "==", authUser.uid)
      .where("date", ">=", getUnixTime(startOfMonth(currentDate)))
      .where("date", "<=", getUnixTime(endOfMonth(currentDate)))
      .get()
      .then(snapshot => {
        if (snapshot.size) {
          let budgets = [];
          snapshot.forEach(doc => budgets.push({ ...doc.data(), id: doc.id }));
          this.setState({ budgets });
        } else {
          this.setState({ budgets: [] });
        }

        this.setState({ loadingBudgets: false });
      })
      .catch(error => console.error(error));
  }

  setCurrentDate = currentDate => {
    this.setState({ currentDate });
    this.fetchExpenses(currentDate);
    this.fetchBudgets(currentDate);
  };

  render() {
    const {
      loadingExpenses,
      loadingBudgets,
      currentDate,
      budgets,
      expenses
    } = this.state;
    const { authUser } = this.props;

    if (loadingExpenses || loadingBudgets) {
      return null;
    }

    const formattedBudgets = chain(budgets)
      .map(b => {
        const expensesForBudget = expenses.filter(e => e.budgetId === b.id);
        return { ...b, current: getTotalAmountFromArray(expensesForBudget) };
      })
      .sortBy("name")
      .value();

    return (
      <main>
        <header className="mb3 flex flex--between">
          <div>
            <h1 className="mb0">Budgets</h1>
            <nav>
              <Link
                to={`/new/budget/${getYear(currentDate)}/${getMonth(
                  currentDate
                )}`}
              >
                New budget
              </Link>{" "}
              <Link
                to={`/clone/${getYear(currentDate)}/${getMonth(currentDate)}`}
              >
                Clone budgets
              </Link>
            </nav>
          </div>
          <MonthNav
            currentDate={currentDate}
            setCurrentDate={this.setCurrentDate}
          />
        </header>
        {formattedBudgets.length ? (
          <ol className="budget-list">
            {formattedBudgets.map(budget => {
              let warningOrDangerClass = "";
              if (budget.current > budget.amount * 0.7) {
                warningOrDangerClass = "warning";
              }
              if (budget.current >= budget.amount) {
                warningOrDangerClass = "danger";
              }

              return (
                <li className="budget" key={budget.id}>
                  <div className="budget-title">
                    <Link
                      to={{
                        pathname: `/budget/${budget.id}`,
                        state: { budget }
                      }}
                    >
                      <span
                        className="color-pill"
                        style={{ backgroundColor: budget.color }}
                      />
                      {budget.name}
                    </Link>
                    <em className={warningOrDangerClass}>
                      {formatAmountInCurrency(
                        budget.current,
                        authUser.currency
                      )}{" "}
                      /{" "}
                      {formatAmountInCurrency(budget.amount, authUser.currency)}
                    </em>
                  </div>
                  <div
                    className="bar bar--small"
                    style={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }}
                  >
                    <span
                      className="bar__segment"
                      style={{
                        width: `${formatAmountInPercent(
                          (budget.current / budget.amount) * 100
                        )}`
                      }}
                    ></span>
                  </div>
                </li>
              );
            })}
          </ol>
        ) : (
          <Blankslate
            title="Nothing to show"
            description="Looks like you have not added any budgets for this month yet."
          />
        )}
      </main>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthUser,
  withAuthorization(condition)
)(Budgets);
