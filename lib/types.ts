export type TransactionType= "income" | "expense";
export type Timeframe = "month" | "year";
export type Period={year:number,month:number}
export type TransactionCSV =  {
    category: string,
    categoryIcon: string,
    description: string,
    type: string,
    amount: number,
    formattedAmount: string,
    date: string,
}