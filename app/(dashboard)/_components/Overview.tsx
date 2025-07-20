"use client"
import { DateRangePicker } from '@/components/ui/date-range-picker'
import { MAX_DATE_RANGE_DAYS } from '@/lib/constants'
import { UserSettings } from '@/lib/generated/prisma'
import { differenceInDays, startOfMonth } from 'date-fns'
import React, { useState } from 'react'
import { toast } from 'sonner'
import { StatsCards } from './StatsCards'
import CategoriesStats from './CategoriesStats'

interface Props {
    userSettings: UserSettings
}

const Overview = ({ userSettings }: Props) => {
    const [dateRange, setDateRange] = useState<{ from: Date, to: Date }>({
        from: startOfMonth(new Date()),
        to: new Date(),
    })
    return (
        <>
            <div className='container flex flex-wrap item-end justify-between gap-2 py-2 px-4'>
                <h2 className='text-2xl font-bold px-4'>
                    Overview
                </h2>
                <div className='flex item-center gap-3'>
                    <DateRangePicker
                        initialDateFrom={dateRange.from}
                        initialDateTo={dateRange.to}
                        onUpdate={(values) => {
                            const { from, to } = values.range;

                            if (!from || !to) return;

                            if (Math.abs(differenceInDays(from, to)) > MAX_DATE_RANGE_DAYS) {
                                toast.error(`The selected date range is too big. Max allowed range is ${MAX_DATE_RANGE_DAYS}`);

                                return;
                            }
                            setDateRange({ from, to });
                        }}

                    />
                </div>
                <div className="container flex w-flex flex-col gap-2 px-4 py-4">
                    <StatsCards userSettings={userSettings} from={dateRange.from} to={dateRange.to} />
                    <CategoriesStats userSettings={userSettings} from={dateRange.from} to={dateRange.to} />
                </div>
            </div>

        </>
    )
}

export default Overview
