import React from "react";
import {
  formatAmountInCurrency,
  formatAmountInPercent,
  getTotalAmountFromArray
} from "../utils";

const Bar = ({ data, currency }) => {
  if (!data || !data.length) {
    return null;
  }

  return (
    <div className="chart">
      <ol className="legend">
        {data.map(({ id, name, color, amount }) => (
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
                  (amount / getTotalAmountFromArray(data)) * 100
                )}
                )
              </small>
            </span>
          </li>
        ))}
      </ol>
      <div className="bar">
        {data.map(({ id, color, amount }) => (
          <div
            key={id}
            className="bar__segment"
            style={{
              backgroundColor: color,
              width: formatAmountInPercent(
                (amount / getTotalAmountFromArray(data)) * 100
              )
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Bar;
