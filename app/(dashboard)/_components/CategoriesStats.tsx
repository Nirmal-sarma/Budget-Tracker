import { GetCategoriesStatsResponseType } from '@/app/api/stats/categories/route';
import SkeletonWrapper from '@/components/SkeletonWrapper';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserSettings } from '@/lib/generated/prisma';
import { DateToUTCDate, GetFormatterForCurrency } from '@/lib/helpers';
import { TransactionType } from '@/lib/types';
import { useQuery } from '@tanstack/react-query';
import React, { ReactNode, useMemo } from 'react'

interface Props {
    from: Date;
    to: Date;
    userSettings: UserSettings;
}

const CategoriesStats = ({ from, to, userSettings }: Props) => {
    const statsQuery = useQuery<GetCategoriesStatsResponseType>({
        queryKey: ["overview", "stats", "categories", from, to],
        queryFn: async () => fetch(`/api/stats/categories?from=${DateToUTCDate(from)}&to=${DateToUTCDate(to)}`)
            .then((res) => res.json()),
    })
    const formatter = useMemo(() => {
        return GetFormatterForCurrency(userSettings.currency);
    }, [userSettings.currency])

    return (
        <div className='flex flex-col lg:flex-row w-full gap-2 rounded-lg border px-4 py-4'>
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <CategoriesCard
                    formatter={formatter}
                    type="income"
                    data={statsQuery.data || []}
                />
            </SkeletonWrapper>
            <SkeletonWrapper isLoading={statsQuery.isFetching}>
                <CategoriesCard
                    formatter={formatter}
                    type="expense"
                    data={statsQuery.data || []}
                />
            </SkeletonWrapper>
        </div>
    )
}

export default CategoriesStats


function CategoriesCard({ formatter, type, data }:
  { formatter: Intl.NumberFormat; type: TransactionType; data: GetCategoriesStatsResponseType }){

    const filterData = data.filter((item) => item.type === type);
    const totalAmount = filterData.reduce((acc, item) => acc + (item._sum.amount || 0), 0);

    return (
        <Card className='h-80 w-full col-span-6 px-4 py-4'>
            <CardHeader>
                <CardTitle className='grid grid-flow-row justify-between gap-2
                    text-muted-foreground md:grid-flow-col'>{type === "income" ? "Income" : "Expense"} Categories
                </CardTitle>
            </CardHeader>
            <div className='flex items-center justify-between gap-2'>
                {filterData.length === 0 && (
                    <div className="flex h-60 w-full flex-col items-center justify-center">
                        No data for selected period
                        <p className="text-sm text-muted-foreground">
                            Try selecting a different period or adding new {type === "income" ? "Income" : "Expense"}

                        </p>
                    </div>

                )}
                {filterData.length > 0 && (
                    <ScrollArea className='h-60 w-full px-4'>
                        <div className="flex w-full flex-col gap-4 p-4">
                            {
                                filterData.map((item) => {

                                    const amount = item._sum?.amount || 0;
                                    const percentage = amount * 100 / (totalAmount || amount);
                                    return (
                                        <div key={item.category} className="flex flex-col gap-2">
                                            <div className="flex items-center justify-between">
                                                <span className="flex items-center">
                                                    {item.categoryIcon} {item.category }
                                                    <span className="text-muted-foreground ml-2">({percentage.toFixed(0)}%)</span>
                                                </span>
                                                <span className="text-sm text-gray-400">
                                                    {formatter.format(amount)}
                                                </span>

                                            </div>
                                            <Progress 
                                            value={percentage}
                                             indicator={type === "income" ? "bg-emerald-500" : "bg-red-500"}
                                            />

                                            
                                        </div>
                                    )

                                })
                            }

                        </div>
                    </ScrollArea>
                )}
            </div>
        </Card>
    );
}
