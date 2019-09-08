import {
  endOfMonth,
  fromUnixTime,
  isWithinInterval,
  startOfMonth
} from "date-fns";
import React from "react";

export const getTotalAmountFromArray = (arr, field = "amount") => {
  if (!arr.length) {
    return 0;
  }

  return arr.reduce((a, b) => a + b[field], 0);
};

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

export const formatAmountInPercent = (amount = 0, decimals = 2) => {
  if (isNaN(amount)) {
    return;
  }

  return Number(amount / 100).toLocaleString(getBrowserLanguage(), {
    style: "percent",
    minimumFractionDigits: decimals
  });
};

export const renderDatalistFromArray = (arr, name) => (
  <datalist id={name}>
    {arr.map((value, idx) => (
      <option key={`${value}-${idx}`} value={value}>
        {value}
      </option>
    ))}
  </datalist>
);

export const toDateInputValue = date => {
  const local = new Date(date);
  local.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return local.toJSON().slice(0, 10);
};

export const isUnixDateWithinMonth = (item, date) =>
  isWithinInterval(fromUnixTime(item.date), {
    start: startOfMonth(date),
    end: endOfMonth(date)
  });