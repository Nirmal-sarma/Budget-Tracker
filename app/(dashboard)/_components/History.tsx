/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  TooltipProps,
} from "recharts";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSettings } from "@/lib/generated/prisma";
import type { HistoryData } from "@/schema/getexport";
import { GetFormatterForCurrency } from "@/lib/helpers";
import { Period, Timeframe } from "@/lib/types";
import React, { useCallback, useMemo, useState } from "react";
import HistoryPeriodSelector from "./HistoryPeriodSelector";
import { useQuery } from "@tanstack/react-query";
import SkeletonWrapper from "@/components/SkeletonWrapper";
import CountUp from "react-countup";
import { cn } from "@/lib/utils";
/* ---------- chart wrapper ---------- */

interface BarDatum { year:number; month:number; day?:number }

const History = ({ userSettings }: { userSettings: UserSettings }) => {
  const [timeframe, setTimeframe] = useState<Timeframe>("month");
  const [period, setPeriod] = useState<Period>({
    year: new Date().getFullYear(),
    month: new Date().getMonth(),
  });

  const currencyFormatter = useMemo(
    () => GetFormatterForCurrency(userSettings.currency),
    [userSettings.currency]
  );

  const { data, isFetching } = useQuery<HistoryData[]>({
    queryKey: ["overview", "history", timeframe, period],
    queryFn: () =>
      fetch(
        `/api/history-data?timeframe=${timeframe}&year=${period.year}&month=${period.month}`
      ).then((res) => res.json()),
  });

  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="container px-6 py-3">
      <h2 className="mt-12 text-3xl font-bold">History</h2>

      <Card className="col-span-12 mt-2 w-full">
        <CardHeader>
          <CardTitle className="grid grid-flow-row justify-between gap-2 md:grid-flow-col">
            <HistoryPeriodSelector
              timeframe={timeframe}
              period={period}
              setPeriod={setPeriod}
              setTimeframe={setTimeframe}
            />

            <div className="flex h-10 gap-2">
              <LegendDot color="bg-emerald-500" label="Income" />
              <LegendDot color="bg-red-500" label="Expense" />
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent>
          <SkeletonWrapper isLoading={isFetching}>
            {hasData ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Array.isArray(data) ? data : []} barCategoryGap={5}>
                  {/* gradients */}
                  <defs>
                    <Gradient id="incomeBar" color="#10b981" />
                    <Gradient id="expenseBar" color="#ef4444" />
                  </defs>

                  <CartesianGrid
                    strokeDasharray="5 5"
                    strokeOpacity={0.2}
                    vertical={false}
                  />

                  <XAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    padding={{ left: 5, right: 5 }}
                    dataKey={(d: HistoryData | BarDatum) => {
                      const date = new Date(d.year, d.month, (d as any).day ?? 1);
                      return timeframe === "year"
                        ? date.toLocaleDateString("default", { month: "long" })
                        : date.toLocaleDateString("default", { day: "2-digit" });
                    }}
                  />

                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Bar dataKey="income" fill="url(#incomeBar)" radius={4} />
                  <Bar dataKey="expense" fill="url(#expenseBar)" radius={4} />

                  <Tooltip
                    cursor={{ opacity: 0.1 }}
                    content={(props) => (
                      <CustomToolTip
                        {...(props as TooltipProps<number, string>)}
                        currencyFormatter={currencyFormatter}
                      />
                    )}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <EmptyState />
            )}
          </SkeletonWrapper>
        </CardContent>
      </Card>
    </div>
  );
};

export default History;



type HistoryRow = { income: number; expense: number };
type RechartsContentProps = {
  active?: boolean;
  label?: string | number;
  payload?: Array<{
    name: string;
    value: number;
    payload: HistoryRow; 
  }>;
};
type ExtraProps = { currencyFormatter: Intl.NumberFormat };

type CustomTooltipProps = RechartsContentProps & ExtraProps;


function CustomToolTip(
  {
  active,
  payload,
  currencyFormatter,
}: CustomTooltipProps
) {
  

  if (!active || !payload?.length) return null;

  const row = payload[0].payload as HistoryRow;

  return (
    <div className="min-w-[300px] rounded bg-background p-4">
      <TooltipRow
        formatter={currencyFormatter}
        label="Expense"
        value={row.expense}
        bgColor="bg-red-500"
        textColor="text-red-500"
      />
      <TooltipRow
        formatter={currencyFormatter}
        label="Income"
        value={row.income}
        bgColor="bg-emerald-500"
        textColor="text-emerald-500"
      />
      <TooltipRow
        formatter={currencyFormatter}
        label="Balance"
        value={row.income - row.expense}
        bgColor="bg-gray-500"
        textColor="text-foreground-500"
      />
    </div>
  );
}



function TooltipRow({
  formatter,
  label,
  value,
  bgColor,
  textColor,
}: {
  formatter: Intl.NumberFormat;
  label: string;
  value: number;
  bgColor: string;
  textColor: string;
}) {
  const fn = useCallback((v: number) => formatter.format(v), [formatter]);

  return (
    <div className="flex items-center gap-2">
      <div className={cn("h-4 w-4 rounded-full", bgColor)} />
      <div className="flex w-full justify-between">
        <p className="text-sm text-muted-foreground">{label}</p>
        <span className={cn("text-sm font-bold", textColor)}>
          <CountUp
            duration={0.5}
            preserveValue
            end={value}
            decimals={0}
            formattingFn={fn}
          />
        </span>
      </div>
    </div>
  );
}


const LegendDot = ({ color, label }: { color: string; label: string }) => (
  <Badge variant="outline" className="flex items-center gap-2 text-sm">
    <div className={cn("h-4 w-4 rounded-full", color)} />
    {label}
  </Badge>
);

const EmptyState = () => (
  <Card className="flex h-[300px] flex-col items-center justify-center bg-background">
    <p>No data for the selected period</p>
    <p className="text-sm text-muted-foreground">
      Try a different period or add new transactions.
    </p>
  </Card>
);

const Gradient = ({ id, color }: { id: string; color: string }) => (
  <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stopColor={color} stopOpacity="1" />
    <stop offset="1" stopColor={color} stopOpacity="0" />
  </linearGradient>
);
