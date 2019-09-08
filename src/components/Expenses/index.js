import { fromUnixTime } from "date-fns";
import { chain, sumBy } from "lodash";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import Blankslate from "../../components/Blankslate";
import Bar from "../Bar";
import withBudgets from "../Budgets/withBudgets";
import MonthNav from "../MonthNav";
import { AuthUserContext, withAuthorization } from "../Session";
import {
  formatAmountInCurrency,
  getTotalAmountFromArray,
  isUnixDateWithinMonth
} from "../utils";
import withExpenses from "./withExpenses";

class Expenses extends Component {
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

    const formattedBudgets = budgets.filter(b =>
      isUnixDateWithinMonth(b, currentDate)
    );

    const formattedExpenses = chain(expenses)
      .filter(e => isUnixDateWithinMonth(e, currentDate))
      .sortBy(e => -e.date)
      .value();

    const leftToSpend =
      sumBy(formattedBudgets, "amount") - sumBy(formattedExpenses, "amount");

    const expensesByBudget = chain(expenses)
      .filter(e => isUnixDateWithinMonth(e, currentDate))
      .groupBy("budgetId")
      .map((b, idx) => {
        const { id, name, color } = budgets.find(b => b.id === idx) || {};
        return { id, name, color, amount: sumBy(b, "amount") };
      })
      .sortBy(b => -b.amount)
      .push({
        id: "_left",
        name: "Left to spend or save",
        color: "rgba(0, 0, 0, 0.05)",
        amount: leftToSpend
      })
      .value();

    return (
      <AuthUserContext.Consumer>
        {authUser => (
          <main>
            <header className="mb3 flex flex--between">
              <div>
                <h1 className="mb0">Expenses</h1>
                <Link to="/new/expense">New expense</Link>
              </div>
              <MonthNav
                currentDate={currentDate}
                setCurrentDate={this.setCurrentDate}
              />
            </header>
            {formattedExpenses.length ? (
              <>
                <Bar data={expensesByBudget} currency={authUser.currency} />
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
                    {formattedExpenses.map(expense => {
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
                            <Link to={`/expenses/${budget.id}`}>
                              {budget.name}
                            </Link>
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
                  <tfoot>
                    <tr>
                      <th colSpan="3" className="tar">
                        Total
                      </th>
                      <td data-label="Total" className="tar bold">
                        {formatAmountInCurrency(
                          getTotalAmountFromArray(formattedExpenses),
                          authUser.currency
                        )}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </>
            ) : (
              <Blankslate
                title="Nothing to show"
                description="Looks like you have not added any expenses for this month yet."
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
)(Expenses);
