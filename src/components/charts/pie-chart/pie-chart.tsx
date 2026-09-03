import styles from "./pie-chart.module.scss";
import { useCallback, useState } from "react";

import {
  Pie,
  Legend,
  PieChart as RePieChart,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  data: any;
  labelKey: string;
  dataKey: string;
}

export const PieChart: React.FC<Props> = ({ data, labelKey, dataKey }) => {
  const [activePie, setActivePie] =
    useState<{
      fill: string;
      key: string;
    } | null>(null);

  const renderLegend = useCallback(
    (props: any, labelKey: string, dataKey: string) => {
      const { payload } = props;

      return (
        <div className={styles.LegendWrapper}>
          {payload.map((entry: any, index: number) => (
            <div
              key={`item-${index}`}
              className={styles.LegendItem}
              style={{
                opacity:
                  activePie && activePie.key !== entry.payload[labelKey]
                    ? 0.3
                    : 1,
              }}
            >
              <div
                style={{
                  backgroundColor: entry.color,
                }}
                className={styles.LegendSquare}
              ></div>
              <div className={styles.LegendLabel}>
                <span>{entry.payload[labelKey]}</span>
                <span className={styles.LegendPercentage}>
                  ({entry.payload[dataKey].toFixed(0)}%)
                </span>
              </div>
            </div>
          ))}
        </div>
      );
    },
    [activePie]
  );

  return (
    <div className={styles.PieWrapper}>
      <ResponsiveContainer height={200} width="100%">
        <RePieChart margin={{ top: -20, left: -20, right: -20, bottom: -20 }}>
          <Pie
            data={data}
            dataKey={dataKey}
            labelLine={false}
            innerRadius="33%"
            isAnimationActive={false}
            paddingAngle={1}
            onMouseOver={(data) => {
              const key = data[labelKey] as string;
              if (!activePie || activePie.key !== key) {
                setActivePie({ key, fill: data.fill });
              }
            }}
            onMouseOut={() => {
              setActivePie(null);
            }}
          >
            {data.map((entry: any, index: number) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.fill}
                opacity={
                  activePie && activePie.key !== entry[labelKey] ? 0.3 : 1
                }
              />
            ))}
          </Pie>

          <Legend
            layout="vertical"
            verticalAlign="middle"
            align="right"
            wrapperStyle={{
              right: -10,
            }}
            content={(props) => renderLegend(props, labelKey, dataKey)}
          />
        </RePieChart>
      </ResponsiveContainer>
    </div>
  );
};
