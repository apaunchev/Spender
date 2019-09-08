import { fromUnixTime, getMonth, getYear } from "date-fns";
import { chain, sumBy } from "lodash";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import Blankslate from "../Blankslate";
import withBudgets from "../Budgets/withBudgets";
import withExpenses from "../Expenses/withExpenses";
import MonthNav from "../MonthNav";
import { AuthUserContext, withAuthorization } from "../Session";
import {
  formatAmountInCurrency,
  formatAmountInPercent,
  getTotalAmountFromArray,
  isUnixDateWithinMonth
} from "../utils";

class Dashboard extends Component {
  state = {
    currentDate: new Date()
  };

  setCurrentDate = currentDate => {
    this.setState({ currentDate });
  };

  render() {
    const { currentDate } = this.state;
    const { budgets, expenses } = this.props;

    if (!budgets.length || !expenses.length) {
      return null;
    }

    const formattedBudgets = chain(budgets)
      .filter(b => isUnixDateWithinMonth(b, currentDate))
      .map(b => {
        const expensesForBudget = expenses
          .filter(e => e.budgetId === b.id)
          .filter(e => isUnixDateWithinMonth(e, currentDate));

        return {
          ...b,
          current: getTotalAmountFromArray(expensesForBudget)
        };
      })
      .sortBy(b => -(b.current / b.amount))
      .value();

    const formattedExpenses = chain(expenses)
      .filter(e => isUnixDateWithinMonth(e, currentDate))
      .sortBy(e => -e.date)
      .value();

    const leftToSpend =
      sumBy(formattedBudgets, "amount") - sumBy(formattedExpenses, "amount");

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <main>
            <h1>
              You have{" "}
              <mark>
                {formatAmountInCurrency(leftToSpend, authUser.currency)}
              </mark>{" "}
              left to spend or save this month.
            </h1>
            <hr />
            <header className="mb3 flex flex--between">
              <div>
                <h2 className="mb0">Expenses</h2>
                <nav>
                  <Link to="/new/expense">New expense</Link>
                </nav>
              </div>
              <MonthNav
                currentDate={currentDate}
                setCurrentDate={this.setCurrentDate}
              />
            </header>
            <section>
              {formattedExpenses.length ? (
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
                    {formattedExpenses.slice(0, 5).map(expense => {
                      const budget =
                        budgets.find(b => b.id === expense.budgetId) || {};

                      return (
                        <tr key={expense.id}>
                          <td data-label="Date">
                            <Link
                              to={{
                                pathname: `/expense/${expense.id}`,
                                state: { expense }
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
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
  withExpenses,
  withBudgets
)(Dashboard);
