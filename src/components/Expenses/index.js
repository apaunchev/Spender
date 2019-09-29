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
    loadingCategories: false,
    currentDate: new Date(),
    expenses: []
  };

  componentDidMount() {
    const { currentDate } = this.state;

    this.fetchExpenses(currentDate);
    this.fetchCategories();
  }

  componentWillUnmount() {
    this.unsubscribeExpenses();
    this.unsubscribeCategories();
  }

  fetchExpenses(currentDate) {
    const { firebase, authUser } = this.props;

    this.setState({ loadingExpenses: true });

    this.unsubscribeExpenses = firebase
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

  fetchCategories() {
    const { firebase, authUser } = this.props;

    this.setState({ loadingCategories: true });

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

        this.setState({ loadingCategories: false });
      });
  }

  setCurrentDate = currentDate => {
    this.unsubscribeExpenses();

    this.setState({ currentDate }, () => {
      this.fetchExpenses(currentDate);
    });
  };

  render() {
    const {
      loadingExpenses,
      loadingCategories,
      currentDate,
      expenses,
      categories
    } = this.state;
    const {
      authUser: { currency }
    } = this.props;

    if (loadingExpenses || loadingCategories) {
      return <Loading isCenter={true} />;
    }

    let expensesByCategory = chain(expenses)
      .groupBy("categoryId")
      .map((c, idx) => {
        const { id, name, color } = categories.find(c => c.id === idx) || {};
        return { id, name, color, amount: sumBy(c, "amount") };
      })
      .sortBy(c => -c.amount)
      .value();

    const expensesByDate = chain(expenses)
      .sortBy(e => -e.date)
      .map(e => {
        const category = categories.find(c => c.id === e.categoryId);
        return {
          ...e,
          categoryName: category.name,
          categoryColor: category.color
        };
      })
      .groupBy(e => fromUnixTime(e.date).toLocaleDateString())
      .mapValues(g => ({
        expenses: [...g],
        total: getTotalAmountFromArray([...g])
      }))
      .value();

    return (
      <main>
        <header className="mb3">
          <h1 className="mb0">Expenses</h1>
          <nav className="mb3">
            <Link to={{ pathname: "/new/expense" }}>New expense</Link>
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
                {expensesByCategory.map(({ id, name, color, amount }) => (
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
                          (amount /
                            getTotalAmountFromArray(expensesByCategory)) *
                            100
                        )}
                        )
                      </small>
                    </span>
                  </li>
                ))}
              </ol>
              <div className="bar">
                {expensesByCategory.map(({ id, name, color, amount }) => (
                  <div
                    key={id}
                    className="bar__segment"
                    title={name}
                    style={{
                      backgroundColor: color,
                      width: `${(amount /
                        getTotalAmountFromArray(expensesByCategory)) *
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
                        expensesByDate[date].expenses.map(e => {
                          return (
                            <li key={e.id} className="expense">
                              <Link
                                to={{
                                  pathname: `/expense/${e.id}`,
                                  state: {
                                    expense: {
                                      ...e,
                                      date: format(
                                        fromUnixTime(e.date),
                                        DATE_FORMAT_ISO
                                      )
                                    }
                                  }
                                }}
                              >
                                <div className="expense-left">
                                  <span className="semibold">
                                    {e.note}
                                    {e.payee ? (
                                      <>
                                        <span className="meta"> @</span>
                                        {e.payee}
                                      </>
                                    ) : null}
                                  </span>
                                  <small className="flex">
                                    <span
                                      className="color-pill"
                                      style={{
                                        backgroundColor: e.categoryColor
                                      }}
                                    />
                                    {e.categoryName}
                                  </small>
                                </div>
                                <div className="expense-right">
                                  <span className="semibold">
                                    {formatAmountInCurrency(e.amount, currency)}
                                  </span>
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
