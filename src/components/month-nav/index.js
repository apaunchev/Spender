import { addMonths, format, subMonths } from "date-fns";
import React from "react";
import { DATE_FORMAT_HUMAN_SHORT } from "../../consts";

const MonthNav = ({ currentDate, setCurrentDate }) => {
  return (
    <nav className="month-nav button-group">
      <button
        className="button"
        onClick={() => setCurrentDate(subMonths(currentDate, 1))}
        title="Go to previous month"
      >
        &larr;
      </button>
      <button
        className="button"
        onClick={() => setCurrentDate(new Date())}
        title="Go to current month"
      >
        {format(currentDate, DATE_FORMAT_HUMAN_SHORT)}
      </button>
      <button
        className="button"
        onClick={() => setCurrentDate(addMonths(currentDate, 1))}
        title="Go to next month"
      >
        &rarr;
      </button>
    </nav>
  );
};

export default MonthNav;
