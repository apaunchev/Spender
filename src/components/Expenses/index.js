import { endOfMonth, fromUnixTime, getUnixTime, startOfMonth } from "date-fns";
import { chain, sumBy } from "lodash";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import Blankslate from "../../components/Blankslate";
import Bar from "../Bar";
import MonthNav from "../MonthNav";
import { withAuthorization, withAuthUser } from "../Session";
import { formatAmountInCurrency, getTotalAmountFromArray } from "../utils";
import { compose } from "recompose";

class Expenses extends Component {
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

    const leftToSpend = sumBy(budgets, "amount") - sumBy(expenses, "amount");

    const expensesByBudget = chain(expenses)
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
      <main>
        <header className="mb3 flex flex--between">
          <div>
            <h1 className="mb0">Expenses</h1>
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
        {expenses.length ? (
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
                {expenses.map(expense => {
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
              <tfoot>
                <tr>
                  <th colSpan="3" className="tar">
                    Total
                  </th>
                  <td data-label="Total" className="tar bold">
                    {formatAmountInCurrency(
                      getTotalAmountFromArray(expenses),
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
    );
  }
}

const condition = authUser => !!authUser;

export default compose(
  withAuthUser,
  withAuthorization(condition)
)(Expenses);
