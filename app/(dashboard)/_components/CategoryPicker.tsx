"use client"

import { Button } from "@/components/ui/button"
import { Command, CommandInput } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Category } from "@/lib/generated/prisma"
import { TransactionType } from "@/lib/types"
import { useQuery } from "@tanstack/react-query"
import React from "react"
import CreateCategoryDialog from "./CreateCategoryDialog"


interface Props{
   type:TransactionType
}

export function CategoryPicker({type}:Props){
    const [open,setOpen]=React.useState(false);
    const [value,setValue]=React.useState("");

    const categories=useQuery({
        queryKey:["categories",type],
        queryFn:()=> fetch(`/api/categories?type=${type}`).then(res => res.json())
    })

    const selectCategory=categories.data?.find((category:Category)=> category.name === value);

    

return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger asChild>
        <Button variant={"outline"} 
        role="combobox" 
        aria-expanded={open}
        className="w-[200px] justify-between">
            {selectCategory ? (<CategoryRow category={selectCategory}/>):"Select category"}
        </Button>
    </PopoverTrigger>
    <PopoverContent className="w-[200px] p-0">
        <Command onSubmit={(e)=>{
            e.preventDefault();
        }}>
            <CommandInput placeholder="search category...."/>
            <CreateCategoryDialog type={type}/>
        </Command>
    </PopoverContent>
</Popover>
}


function CategoryRow({category}:{category:Category}){
    return (
    <div className="flex items-center gap-2">
        <span role="img">{category.icon}</span>
        <span>{category.name}</span>
    </div>
    )
}