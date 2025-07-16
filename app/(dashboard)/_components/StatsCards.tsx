"use client"

import { GetBalanceStatsResponseType } from '@/app/api/stats/balance/route';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Card } from '@/components/ui/card';
import { UserSettings } from '@/lib/generated/prisma';
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers';
import { useQuery } from '@tanstack/react-query';
import { TrendingDown, TrendingDownIcon, TrendingUp, Wallet } from 'lucide-react';
import React, { useCallback, useEffect, useMemo } from 'react'
import CountUp from 'react-countup';

interface Props {
    from: Date;
    to: Date;
    userSettings: UserSettings;
}

export const StatsCards = ({ from, to, userSettings }: Props) => {
    const statsQuery = useQuery<GetBalanceStatsResponseType>({
        queryKey: ["overview", "stats", from, to],
        queryFn: async () => {
            return await fetch(`/api/stats/balance?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`).then((res)=>res.json());

        }
    });

    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency);
    }, [userSettings.currency]);

    const income = statsQuery.data?.income || 0;
    const expense = statsQuery.data?.expense || 0;
    const balance = income - expense;
    
    console.log("StatsCards", { income, expense, balance, userSettings });
    return (
        <div className='flex flex-col lg:flex-row w-full gap-2 rounded-lg border p-4 px-5'>
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <StatsCard formatter={formatter}
                    value={income}
                    title="Income"
                    icon={
                        <TrendingUp className='h-12 w-12 
                        items-center rounded-lg p-2 text-emerald-500 
                        bg-emerald-400/10' />
                    }
                />
            </SkeletonWrapper>
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <StatsCard formatter={formatter}
                    value={expense}
                    title="Expense"
                    icon={
                        <TrendingDown className='h-12 w-12 items-center rounded-lg p-2 text-red-500 bg-red-400/10' />
                    }
                />
            </SkeletonWrapper>
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <StatsCard formatter={formatter}
                    value={(balance)}
                    title="Balance"
                    icon={
                      <Wallet className='h-12 w-12 items-center rounded-lg p-2 text-blue-500 bg-blue-400/10' />
                    }
                />
            </SkeletonWrapper>
        </div>
    )
}


function StatsCard({ title, value, icon, formatter }: { title: string; value: number; icon?: React.ReactNode; formatter: Intl.NumberFormat }) {
    const formatFn = useCallback((value: number) => {
        return formatter.format(value);
    }, [formatter]);


    return (
        <Card className='flex flex-row h-32 w-full items-center gap-2 p-4'>
            <p>{icon}</p>
            <div className='flex flex-col items-start gap-0'>
                <p className='text-muted-foreground'>{title}</p>
                <CountUp
                    preserveValue
                    redraw={true}
                    end={value}
                    decimals={2}
                    formattingFn={formatFn}
                    className='text-2xl'
                />
            </div>
        </Card>
    )
}
