import { format, fromUnixTime, getUnixTime, parseISO } from "date-fns";
import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { compose } from "recompose";
import { DATE_FORMAT_HUMAN, DATE_FORMAT_ISO } from "../../constants/formats";
import withBudgets from "../Budgets/withBudgets";
import { withFirebase } from "../Firebase";

class Clone extends Component {
  state = {
    currentDate: new Date(),
    cloneFromMonth: ""
  };

  componentDidMount() {
    const {
      match: {
        params: { month, year }
      }
    } = this.props;

    if (year && month) {
      this.setState({ currentDate: new Date(year, month, 1) });
    }
  }

  onSubmit = event => {
    event.preventDefault();

    const { budgets, history, firebase } = this.props;
    const { currentDate, cloneFromMonth } = this.state;

    const budgetsToClone = budgets
      .filter(
        b => format(fromUnixTime(b.date), DATE_FORMAT_ISO) === cloneFromMonth
      )
      .map(b => ({
        ...b,
        date: getUnixTime(currentDate)
      }));

    if (
      budgetsToClone.length &&
      window.confirm(
        `We are about to clone ${budgetsToClone.length} budgets from ${format(
          parseISO(cloneFromMonth),
          DATE_FORMAT_HUMAN
        )} into ${format(
          currentDate,
          DATE_FORMAT_HUMAN
        )}. Do you want to proceed?`
      )
    ) {
      budgetsToClone.forEach(b => {
        firebase.expenses().add({ ...b });
      });

      history.push("/dashboard");
    }
  };

  render() {
    const { currentDate, cloneFromMonth } = this.state;
    const { budgets } = this.props;
    const getAvailableMonthsFromBudgets = budgets
      .map(b => fromUnixTime(b.date))
      .filter(
        (date, i, self) =>
          self.findIndex(d => d.getTime() === date.getTime()) === i
      )
      .filter(d => d.getTime() !== currentDate.getTime())
      .sort((a, b) => (a.getTime() > b.getTime() ? -1 : 1));

    return (
      <main>
        <h1>Clone budgets</h1>
        <p>
          This operation will clone the budgets from the selected month into{" "}
          <strong>{format(currentDate, DATE_FORMAT_HUMAN)}</strong>.
        </p>
        <form className="form" onSubmit={this.onSubmit}>
          <div className="form-input">
            <label htmlFor="cloneFromMonth">Clone from</label>
            <select
              name="cloneFromMonth"
              id="cloneFromMonth"
              value={cloneFromMonth}
              onChange={event =>
                this.setState({ cloneFromMonth: event.target.value })
              }
              required
            >
              <option value="" disabled hidden>
                Select a month...
              </option>
              {getAvailableMonthsFromBudgets.map((m, idx) => (
                <option key={`month-${idx}`} value={format(m, DATE_FORMAT_ISO)}>
                  {format(m, DATE_FORMAT_HUMAN)}
                </option>
              ))}
            </select>
            {!getAvailableMonthsFromBudgets.length ? (
              <p className="danger mt2 mb0">
                There are no months available to clone from.
              </p>
            ) : null}
          </div>
          <div className="form-input">
            <input
              type="submit"
              className="button button--primary"
              value="Clone"
            />
          </div>
        </form>
      </main>
    );
  }
}

export default compose(
  withRouter,
  withFirebase,
  withBudgets
)(Clone);
