import { getMonth, getYear } from "date-fns";
import { chain } from "lodash";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import Blankslate from "../../components/Blankslate";
import withExpenses from "../Expenses/withExpenses";
import MonthNav from "../MonthNav";
import { AuthUserContext, withAuthorization } from "../Session";
import {
  formatAmountInCurrency,
  formatAmountInPercent,
  getTotalAmountFromArray,
  isUnixDateWithinMonth
} from "../utils";
import withBudgets from "./withBudgets";

class Budgets extends Component {
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
      .sortBy("name")
      .value();

    return (
      <AuthUserContext.Consumer>
        {authUser => (
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
                    to={`/clone/${getYear(currentDate)}/${getMonth(
                      currentDate
                    )}`}
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
          </main>
        )}
      </AuthUserContext.Consumer>
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthorization(condition),
  withBudgets,
  withExpenses
)(Budgets);
