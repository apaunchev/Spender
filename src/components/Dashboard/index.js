import {
  endOfMonth,
  fromUnixTime,
  getMonth,
  getUnixTime,
  getYear,
  startOfMonth
} from "date-fns";
import { chain, sumBy } from "lodash";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import Blankslate from "../Blankslate";
import MonthNav from "../MonthNav";
import { withAuthorization, withAuthUser } from "../Session";
import {
  formatAmountInCurrency,
  formatAmountInPercent,
  getTotalAmountFromArray
} from "../utils";
import { compose } from "recompose";

class Dashboard extends Component {
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
      .orderBy("date", "desc")
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
      .orderBy("date")
      .orderBy("name")
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
      .sortBy(b => -(b.current / b.amount))
      .value();

    const leftToSpend =
      sumBy(formattedBudgets, "amount") - sumBy(expenses, "amount");

    return (
      <main>
        <h1>
          You have{" "}
          <mark>{formatAmountInCurrency(leftToSpend, authUser.currency)}</mark>{" "}
          left to spend or save this month.
        </h1>
        <hr />
        <header className="mb3 flex flex--between">
          <div>
            <h2 className="mb0">Expenses</h2>
            <nav>
              <Link to={{ pathname: "/new/expense", state: { budgets } }}>
                New expense
              </Link>
            </nav>
          </div>
          <MonthNav
            currentDate={currentDate}
            setCurrentDate={this.setCurrentDate}
          />
        </header>
        <section>
          {expenses.length ? (
            <table className="table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Budget</th>
                  <th>Payee</th>
                  <th className="tar">Amount</th>
                </tr>
              </thead>
              <tbody>
                {expenses.slice(0, 5).map(expense => {
                  const budget =
                    budgets.find(b => b.id === expense.budgetId) || {};

                  return (
                    <tr key={expense.id}>
                      <td data-label="Date">
                        <Link
                          to={{
                            pathname: `/expense/${expense.id}`,
                            state: { expense, budgets }
                          }}
                        >
                          {new Date(
                            fromUnixTime(expense.date)
                          ).toLocaleDateString()}
                        </Link>
                      </td>
                      <td data-label="Budget">
                        <span
                          className="color-pill"
                          style={{
                            backgroundColor: budget.color
                          }}
                        />
                        {budget.name}
                      </td>
                      <td data-label="Payee">{expense.payee || "–"}</td>
                      <td data-label="Amount" className="tar">
                        {formatAmountInCurrency(
                          expense.amount,
                          authUser.currency
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <Blankslate
              title="Nothing to show"
              description="Looks like you have not added any expenses for this month yet."
            />
          )}
        </section>
        <header className="mb3 flex flex--between">
          <div>
            <h2 className="mb0">Budgets</h2>
            <nav>
              <Link
                to={`/new/budget/${getYear(currentDate)}/${getMonth(
                  currentDate
                )}`}
              >
                New budget
              </Link>
            </nav>
          </div>
        </header>
        <section>
          {formattedBudgets.length ? (
            <ol className="budget-list">
              {formattedBudgets.slice(0, 5).map(budget => {
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
                        {formatAmountInCurrency(
                          budget.amount,
                          authUser.currency
                        )}
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
        </section>
      </main>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthUser,
  withAuthorization(condition)
)(Dashboard);
