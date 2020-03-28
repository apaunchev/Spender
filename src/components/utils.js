import {
  parseISO,
  isValid,
  isBefore,
  isFuture,
  addWeeks,
  addMonths,
  addYears,
  differenceInWeeks,
  differenceInMonths,
  differenceInYears,
  endOfWeek,
  endOfMonth,
  endOfYear
} from "date-fns";
import MODES from "../constants/modes";

export const getBrowserLanguage = () =>
  navigator.language ||
  navigator.browserLanguage ||
  (navigator.languages || ["en"])[0];

export const formatAmountInCurrency = (amount = 0, currency = "EUR") => {
  const formatter = new Intl.NumberFormat(getBrowserLanguage(), {
    style: "currency",
    currency
  });

  return formatter.format(amount);
};

export const groupBy = (list, prop) =>
  list.reduce((a, b) => {
    (a[b[prop]] = a[b[prop]] || []).push(b);
    return a;
  }, {});

export const sumBy = (list, prop) => list.reduce((a, b) => a + b[prop], 0);

export const getNextDueDate = (date, repeatMode) => {
  const firstDue = parseISO(date);

  if (!isValid(firstDue)) return null;

  // if first due date is in the future, return it now
  if (isFuture(firstDue)) return firstDue;

  // otherwise, we assume it is in the past and need to calculate it
  const now = new Date();

  if (repeatMode === MODES.WEEK) {
    return addWeeks(firstDue, Math.abs(differenceInWeeks(firstDue, now)) + 1);
  }

  if (repeatMode === MODES.MONTH) {
    return addMonths(firstDue, Math.abs(differenceInMonths(firstDue, now)) + 1);
  }

  if (repeatMode === MODES.YEAR) {
    return addYears(firstDue, Math.abs(differenceInYears(firstDue, now)) + 1);
  }
};

export const getRemainingDueDatesForYear = (dueDate, repeatMode) => {
  const dates = [];
  const aYearFromNow = addYears(new Date(), 1);
  let currentDueDate = dueDate;

  if (repeatMode === MODES.WEEK) {
    while (isBefore(currentDueDate, aYearFromNow)) {
      dates.push(currentDueDate);
      currentDueDate = addWeeks(currentDueDate, 1);
    }
  }

  if (repeatMode === MODES.MONTH) {
    while (isBefore(currentDueDate, aYearFromNow)) {
      dates.push(currentDueDate);
      currentDueDate = addMonths(currentDueDate, 1);
    }
  }

  if (repeatMode === MODES.YEAR) {
    while (isBefore(currentDueDate, aYearFromNow)) {
      dates.push(currentDueDate);
      currentDueDate = addYears(currentDueDate, 1);
    }
  }

  return dates;
};

export const getAverageAmounts = (amount, repeatMode) => {
  const average = { week: 0, month: 0, year: 0 };

  if (repeatMode === MODES.WEEK) {
    average.week = amount;
    average.month = amount * 4;
    average.year = amount * 52;
  }

  if (repeatMode === MODES.MONTH) {
    average.week = amount / 4;
    average.month = amount;
    average.year = amount * 12;
  }

  if (repeatMode === MODES.YEAR) {
    average.week = amount / 52;
    average.month = amount / 12;
    average.year = amount;
  }

  return average;
};

export const getRemainingAmounts = (amount, repeatMode, dueDate) => {
  const now = new Date();
  const endOf = {
    week: endOfWeek(now),
    month: endOfMonth(now),
    year: endOfYear(now)
  };
  let currentDueDate = dueDate;
  let remaining = { week: 0, month: 0, year: 0 };

  if (repeatMode === MODES.WEEK) {
    while (isBefore(currentDueDate, endOf.year)) {
      if (isBefore(currentDueDate, endOf.week)) {
        remaining.week += amount;
      }

      if (isBefore(currentDueDate, endOf.month)) {
        remaining.month += amount;
      }

      if (isBefore(currentDueDate, endOf.year)) {
        remaining.year += amount;
      }

      currentDueDate = addWeeks(currentDueDate, 1);
    }
  }

  if (repeatMode === MODES.MONTH) {
    while (isBefore(currentDueDate, endOf.year)) {
      if (isBefore(currentDueDate, endOf.week)) {
        remaining.week += amount;
      }

      if (isBefore(currentDueDate, endOf.month)) {
        remaining.month += amount;
      }

      if (isBefore(currentDueDate, endOf.year)) {
        remaining.year += amount;
      }

      currentDueDate = addMonths(currentDueDate, 1);
    }
  }

  if (repeatMode === MODES.YEAR) {
    while (isBefore(currentDueDate, endOf.year)) {
      if (isBefore(currentDueDate, endOf.week)) {
        remaining.week += amount;
      }

      if (isBefore(currentDueDate, endOf.month)) {
        remaining.month += amount;
      }

      if (isBefore(currentDueDate, endOf.year)) {
        remaining.year += amount;
      }

      currentDueDate = addYears(currentDueDate, 1);
    }
  }

  return remaining;
};

export const fetchRatesForCurrency = async currency => {
  const LS_KEY = "rates";
  const cachedRates = localStorage.getItem(LS_KEY);

  if (cachedRates) {
    return JSON.parse(cachedRates);
  }

  const response = await fetch(
    `https://api.openrates.io/latest?base=${currency}`
  );
  const json = await response.json();

  localStorage.setItem(LS_KEY, JSON.stringify(json.rates));

  return json.rates;
};
