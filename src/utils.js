import React from "react";

export const getTotalAmountFromArray = arr => {
  if (!arr.length) {
    return 0;
  }

  return arr.reduce((a, b) => a + b.amount, 0);
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

export const formatAmountInPercent = (amount = 0, decimals = 2) =>
  Number(amount / 100).toLocaleString(getBrowserLanguage(), {
    style: "percent",
    minimumFractionDigits: decimals
  });

export const ID = () => {
  return (
    "_" +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
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

export const compareBy = (key, desc = false) => {
  return function(a, b) {
    if (!desc) {
      return a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0;
    }

    return a[key] > b[key] ? -1 : b[key] > a[key] ? 1 : 0;
  };
};

export const groupBy = (objectArray, property) => {
  return objectArray.reduce((acc, obj) => {
    const key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
};

export const sumOfObjectValues = (objectArray, property) =>
  objectArray.reduce((acc, cur) => acc + cur[property], 0);
