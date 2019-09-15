import {
  endOfMonth,
  format,
  fromUnixTime,
  getUnixTime,
  startOfMonth
} from "date-fns";
import { chain, sumBy } from "lodash";
import React, { Component } from "react";
import { Link } from "react-router-dom";
import { compose } from "recompose";
import Blankslate from "../../components/Blankslate";
import { DATE_FORMAT_ISO } from "../../constants/formats";
import MonthNav from "../MonthNav";
import { withAuthorization, withAuthUser } from "../Session";
import {
  formatAmountInCurrency,
  formatAmountInPercent,
  getTotalAmountFromArray
} from "../utils";
import Loading from "../Loading";

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
      .onSnapshot(snapshot => {
        if (snapshot.size) {
          let expenses = [];
          snapshot.forEach(doc => expenses.push({ ...doc.data(), id: doc.id }));
          this.setState({ expenses });
        } else {
          this.setState({ expenses: [] });
        }

        this.setState({ loadingExpenses: false });
      });
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
      .onSnapshot(snapshot => {
        if (snapshot.size) {
          let budgets = [];
          snapshot.forEach(doc => budgets.push({ ...doc.data(), id: doc.id }));
          this.setState({ budgets });
        } else {
          this.setState({ budgets: [] });
        }

        this.setState({ loadingBudgets: false });
      });
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
    const {
      authUser: { currency }
    } = this.props;

    if (loadingExpenses || loadingBudgets) {
      return <Loading isCenter={true} />;
    }

    const totalPlanned = sumBy(budgets, "amount");
    const totalSpent = sumBy(expenses, "amount");
    const leftToSpend = totalPlanned - totalSpent;
    let leftToSpendCumulative = totalPlanned;
    const expensesByDate = chain(expenses)
      .sortBy(e => e.date)
      .map(e => {
        const { name, color } = budgets.find(b => b.id === e.budgetId) || {};
        leftToSpendCumulative = leftToSpendCumulative - e.amount;
        return {
          ...e,
          budgetName: name,
          budgetColor: color,
          leftToSpendCumulative
        };
      })
      .sortBy(e => e.leftToSpendCumulative)
      .groupBy(e => fromUnixTime(e.date).toLocaleDateString())
      .mapValues(g => ({
        expenses: [...g],
        total: getTotalAmountFromArray([...g])
      }))
      .value();
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
        <header className="mb3">
          <h1 className="mb0">Expenses</h1>
          <nav className="mb3">
            <Link to={{ pathname: "/new/expense", state: { budgets } }}>
              New expense
            </Link>
          </nav>
          <MonthNav
            currentDate={currentDate}
            setCurrentDate={this.setCurrentDate}
          />
        </header>
        {expenses.length ? (
          <>
            <div className="chart">
              <ol className="legend">
                {expensesByBudget.map(({ id, name, color, amount }) => (
                  <li key={id}>
                    <span
                      className="color-pill"
                      style={{
                        backgroundColor: color || "#212121"
                      }}
                    />
                    <span>
                      {name} - {formatAmountInCurrency(amount, currency)}{" "}
                      <small>
                        (
                        {formatAmountInPercent(
                          (amount / getTotalAmountFromArray(expensesByBudget)) *
                            100
                        )}
                        )
                      </small>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="scale">
                <span>
                  {formatAmountInCurrency(totalSpent, currency)} spent
                </span>
                <span>
                  {formatAmountInCurrency(leftToSpend, currency)} left
                </span>
              </div>
              <div className="bar">
                {expensesByBudget.map(({ id, color, amount }) => (
                  <div
                    key={id}
                    className="bar__segment"
                    style={{
                      backgroundColor: color,
                      width: `${(amount /
                        getTotalAmountFromArray(expensesByBudget)) *
                        100}%`
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="expenses">
              {Object.keys(expensesByDate).map((date, idx) => {
                return (
                  <div key={`group-${idx}`} className="expenses-group">
                    <h5 className="expenses-title">
                      <strong>{date}</strong>
                      <strong>
                        {formatAmountInCurrency(
                          expensesByDate[date].total,
                          currency
                        )}
                      </strong>
                    </h5>
                    <ol className="expenses-list">
                      {expensesByDate[date].expenses &&
                        expensesByDate[date].expenses.map(expense => {
                          return (
                            <li key={expense.id} className="expense">
                              <Link
                                to={{
                                  pathname: `/expense/${expense.id}`,
                                  state: {
                                    expense: {
                                      ...expense,
                                      date: format(
                                        fromUnixTime(expense.date),
                                        DATE_FORMAT_ISO
                                      )
                                    },
                                    budgets
                                  }
                                }}
                              >
                                <div className="expense-left">
                                  <span className="semibold">
                                    {expense.note || "Expense"}{" "}
                                    {expense.payee ? (
                                      <>
                                        <span className="meta">@</span>
                                        {expense.payee}
                                      </>
                                    ) : null}
                                  </span>
                                  <small className="flex">
                                    <span
                                      className="color-pill"
                                      style={{
                                        backgroundColor: expense.budgetColor
                                      }}
                                    />
                                    {expense.budgetName}
                                  </small>
                                </div>
                                <div className="expense-right">
                                  <span className="semibold">
                                    {formatAmountInCurrency(
                                      expense.amount,
                                      currency
                                    )}
                                  </span>
                                  <small className="meta">
                                    {formatAmountInCurrency(
                                      expense.leftToSpendCumulative,
                                      currency
                                    )}
                                  </small>
                                </div>
                              </Link>
                            </li>
                          );
                        })}
                    </ol>
                  </div>
                );
              })}
            </div>
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
