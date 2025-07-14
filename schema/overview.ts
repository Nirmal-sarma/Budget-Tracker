import { MAX_DATE_RANGE_DAYS } from "@/lib/constants";
import { differenceInDays } from "date-fns";
import z from "zod";

export const OverviewQuerySchema = z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
}).refine((args)=>{
    const { from, to } = args;
    const days=Math.abs(differenceInDays(from, to));
    console.log("from:", from, "to:", to, "days:", days);
    const isValid= days >= 0 && days <= MAX_DATE_RANGE_DAYS;
    return isValid;
},{ message: "Invalid input" })