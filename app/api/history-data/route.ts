import { getHistoryData, getHistoryDataSchema } from "@/schema/getexport";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";





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
