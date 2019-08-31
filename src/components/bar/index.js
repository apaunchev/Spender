import React from "react";
import {
  getTotalAmountFromArray,
  formatAmountInPercent,
  compareBy
} from "../../utils";

const Bar = ({ data, limit = 5 }) => {
  if (!data || !data.length) {
    return null;
  }

  const sorted = [...data].sort(compareBy("amount", true));
  const final = [
    ...sorted.slice(0, limit),
    {
      id: "_others",
      name: "Others",
      amount: getTotalAmountFromArray(sorted.slice(limit))
    }
  ];

  return (
    <div className="chart">
      <ol className="legend">
        {final.map(({ id, name, color, amount }) => (
          <li key={id}>
            <span
              className="color-pill"
              style={{
                backgroundColor: color || "#212121"
              }}
            />
            <span>
              {name}{" "}
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
        {final.map(({ id, name, color, amount }) => {
          const percent = formatAmountInPercent(
            (amount / getTotalAmountFromArray(data)) * 100
          );

          return (
            <div
              key={id}
              className="bar__segment"
              style={{
                backgroundColor: color,
                width: percent
              }}
              title={`${name} (${percent})`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default Bar;
