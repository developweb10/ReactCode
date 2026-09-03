import styles from "./bar-chart.module.scss";
import { useRef, useCallback } from "react";

import {
  ResponsiveContainer,
  BarChart as ReBarChart,
  Bar,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const renderLegend = (props: any) => {
  const { payload } = props;

  return (
    <div className={styles.LegendWrapper}>
      {payload.map((entry: any, index: number) => (
        <div key={`item-${index}`} className={styles.LegendItem}>
          <div
            style={{
              backgroundColor: entry.color,
            }}
            className={styles.LegendSquare}
          ></div>
          <span className={styles.LegendLabel}>{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

interface BarKey {
  key: string;
  fill: string;
}

interface Props {
  barDataKeys: BarKey[];
  barData: { [key: string]: any }[];
}

export const YearBarChart: React.FC<Props> = ({ barDataKeys, barData }) => {
  // const containerRef = useRef<ResponsiveContainer | null>(null);
  const containerRef = useRef<any>(null);


  const renderYearTick = useCallback((tickProps: any) => {
    const { x, y, payload } = tickProps;

    const { offset } = payload;

    const isLast = payload.value === "Dec";

    const pathX = Math.floor(x + offset) + 0.5;

    let height = 180;

    if (containerRef && containerRef?.current) {
      height = containerRef?.current?.state?.containerHeight as number;
    }

    return (
      <>
        {!isLast && (
          <path d={`M${pathX},${y + 5}v${-height + 68}`} stroke="#eee" />
        )}
        <text
          className={styles.MonthName}
          fill="#ccc"
          x={x}
          y={y + 14}
          textAnchor="middle"
        >
          {payload.value}
        </text>
        ;
      </>
    );
  }, []);

  return (
    <ResponsiveContainer
      ref={containerRef}
      minHeight={200}
      width="100%"
      height="100%"
    >
      <ReBarChart data={barData} barGap={0} margin={{ left: -20, top: 15 }}>
        <CartesianGrid stroke="#eee" strokeWidth={1} vertical={false} />

        <XAxis
          interval={0}
          dataKey="month"
          stroke="#eee"
          strokeWidth={1}
          tick={renderYearTick}
          tickLine={false}
          scale="band"
        />

        <YAxis
          stroke="#eee"
          interval={1}
          tickLine={{ stroke: "#ccc" }}
          tick={{ fontSize: 16, fill: "#ccc" }}
        />

        <Tooltip cursor={{ fill: "#fafafa" }} />
        <Legend
          verticalAlign="top"
          height={36}
          align="left"
          iconType="square"
          iconSize={16}
          wrapperStyle={{
            left: 13,
            top: 5,
            width: "auto",
          }}
          content={renderLegend}
        />
        {barDataKeys.map((barData) => (
          <Bar
            key={barData.key}
            dataKey={barData.key}
            fill={barData.fill}
            radius={[5, 5, 0, 0]}
          />
        ))}
      </ReBarChart>
    </ResponsiveContainer>
  );
};
