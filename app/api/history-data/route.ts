import { prisma } from "@/lib/prisma";
import { Period, Timeframe } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import z from "zod";

export const getHistoryDataSchema = z.object({
    timeframe: z.enum(["month", "year"]),
    year: z.coerce.number().min(2000).max(3000),
    month: z.coerce.number().min(1).max(12).default(0)
});


export async function GET(request: Request) {
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in");
    }
    const { searchParams } = new URL(request.url);
    const Timeframe = searchParams.get("timeframe")
    const year = searchParams.get("year")
    const month = searchParams.get("month")

    const queryParams = getHistoryDataSchema.safeParse({
        timeframe: Timeframe,
        year,
        month
    });

    if (!queryParams.success) {
        return Response.json(queryParams.error.message, { status: 400 });
    }
    const data = await getHistoryData(user.id, queryParams.data.timeframe, {
        month: queryParams.data.month,
        year: queryParams.data.year,
    });

    return Response.json(data);
}
export type GetHistoryDataResponseType = Awaited<ReturnType<typeof getHistoryData>>;
function getHistoryData(userId: string, timeframe: Timeframe, period: Period) {

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
async function getYearHistoryData(userId: string, year: number) {
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

async function getMonthHistoryData(userId: string, year: number, month: number) {
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