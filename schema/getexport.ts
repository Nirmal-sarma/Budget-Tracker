import { GetFormatterForCurrency } from "@/lib/helpers";
import { prisma } from "@/lib/prisma";
import { Period, Timeframe } from "@/lib/types";
import { getDaysInMonth } from "date-fns";
import z from "zod";

// history-data
export const getHistoryDataSchema = z.object({
    timeframe: z.enum(["month", "year"]),
    year: z.coerce.number().min(2000).max(3000),
    month: z.coerce.number().min(1).max(12).default(0)
});


export type GetHistoryDataResponseType = Awaited<ReturnType<typeof getHistoryData>>;
export function getHistoryData(userId: string, timeframe: Timeframe, period: Period) {

    switch (timeframe) {
        case "year": return getYearHistoryData(userId, period.year)
        case "month": return getMonthHistoryData(userId, period.year, period.month);
        default: throw new Error("Invalid timeframe");
    }
}
type HistoryData = {
    day?: number;
    year: number;
    month: number;
    income: number;
    expense: number;
}
export async function getYearHistoryData(userId: string, year: number) {
    const result = await prisma.yearHistory.groupBy({
        by: ["month"],

        where: {
            userId,
            year,
        },
        _sum: {
            income: true,
            expense: true,
        },
        orderBy: [{
            month: "asc",
        },
        ],
    });
    if (!result || result.length === 0) return [];

    const history: HistoryData[] = [];

    for (let i = 0; i < 12; i++) {
        let income = 0;
        let expense = 0;

        const month = result.find((row) => row.month === i)

        if (month) {
            expense = month._sum.expense || 0;
            income = month._sum.income || 0;
        }
        history.push({
            year,
            month: i,
            income,
            expense
        });
    }
    return history;
}

export async function getMonthHistoryData(userId: string, year: number, month: number) {
    const result = await prisma.monthHistory.groupBy({
        by: ["day"],
        where: {
            userId,
            year,
            month,
        },
        _sum: {
            income: true,
            expense: true,
        },
        orderBy: [{
            day: "asc",
        }],
    });

if (!result || result.length === 0) return [];

const history: HistoryData[] = [];

const daysInMonth = getDaysInMonth(new Date(year, month))

for(let i=1;i<=daysInMonth;i++){
    let income = 0;
    let expense = 0;

    const dayData = result.find((row) => row.day === i)

    if (dayData) {
        expense = dayData._sum.expense || 0;
        income = dayData._sum.income || 0;
    }
    history.push({
        year,
        month,
        day: i,
        income,
        expense
    });



}
return history;
}


//history-periods


export type GetHistoryPeriodsResponseType = Awaited<ReturnType<typeof getHistoryPeriods>>;

export async function getHistoryPeriods(userId: string) {
    const result = await prisma.monthHistory.findMany({
        where: {
            userId,
        },
        select: {
            year: true
        },
        distinct: ["year"],
        orderBy: [
            {
                year: "asc",
            },
        ],
    });

    const year = result.map(ele => ele.year);

    if(year.length === 0){
        return [new Date().getFullYear()];
    }
    return year;
}


// /stats/balance

export type GetBalanceStatsResponseType= Awaited<ReturnType<typeof getBalanceStats>>;

export async function getBalanceStats(userId: string, from:Date, to:Date) {
   const totals=await prisma.transaction.groupBy({
        by: ["type"],
        where: {
            userId,
            createdAt: {
                gte: from,
                lte: to,
            },
        },
        _sum: {
            amount: true,
        },
    });
    return {
        expense:totals.find((t) => t.type === "expense")?._sum.amount ?? 0,
        income:totals.find((t) => t.type === "income")?._sum.amount ?? 0,
    }
}

// stats/categories

export type GetCategoriesStatsResponseType = Awaited<ReturnType<typeof getCategoriesStats>>;

export async function getCategoriesStats(userId: string, from: Date, to: Date) {
    const stats = await prisma.transaction.groupBy({
        by: ["type", "category", "categoryIcon"],
        where: {
            userId,
            date: {
                gte: from,
                lte: to
            },
        },
        _sum: {
            amount: true,
        },
        orderBy: {
            _sum: {
                amount: "desc"
            }
        }
    })

    return stats;
}

// transactions-history

export type GetTransactionHistoryResponseType = Awaited<ReturnType<typeof getTransactionHistory>>;
export async function getTransactionHistory(userId:string,from:Date,to:Date){
    const userSettings=await prisma.userSettings.findUnique({
        where:{
            userId,
        }
    });

    if(!userSettings){
        throw new Error("user settings not found");
    }

    const formatter=GetFormatterForCurrency(userSettings.currency);
    const transactions=await prisma.transaction.findMany({
        where:{
            userId,
            date:{
                gte:from,
                lte:to
            }
        },
        orderBy:{
            date:"desc"
        }
    });

    return transactions.map((transaction) => ({
        ...transaction,
        formattedAmount: formatter.format(transaction.amount)
    }));
}