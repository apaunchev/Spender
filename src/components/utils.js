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

export const fillRange = (start, end) =>
  Array(end - start + 1)
    .fill()
    .map((item, index) => start + index);

export const groupBy = (list, prop) =>
  list.reduce((a, b) => {
    (a[b[prop]] = a[b[prop]] || []).push(b);
    return a;
  }, {});

export const sumBy = (list, prop) => list.reduce((a, b) => a + b[prop], 0);
