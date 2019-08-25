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
          >
            <span className="bar__segment__title">
              {name} ({percent})
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default Bar;
