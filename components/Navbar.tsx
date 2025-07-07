'use client'
import React, { useState } from 'react'
import Logo, { LogoMobile } from './Logo'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button, buttonVariants } from './ui/button'
import { cn } from '@/lib/utils'
import { UserButton } from '@clerk/nextjs'
import { ThemeSwitchBtn } from './ThemeSwitchBtn'
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet'
import { Menu } from 'lucide-react'

const Navbar = () => {
  return (
    <div>
      <DesktopNavbar/>
      <MobileNavber/>
    </div>
  )
}

const items=[
    {label:"Dashboard",link:"/"},
    {label:"Transactions",link:"/transactions"},
    {label:"Manage",link:"/manage"}
]

function MobileNavber(){
const [isOpen,setIsOpen]=useState(false)

return(
    <div className="block border-separate bg-background md:hidden">
        <nav className="container flex items-center justify-between px-8">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
                <Button variant={"ghost"} size={"icon"}>
                   <Menu/>
                </Button>
            </SheetTrigger>
            <SheetContent className='w-[400px] sm:w-[540px]' side="left">
               <Logo/>
               {items.map(item =>(
                <NavbarItem 
                key={item.label} 
                label={item.label} 
                link={item.link}
                clickCallback={()=> setIsOpen(prev => !prev)}
                />
               ))}
            </SheetContent>
        </Sheet>
        <div className="flex h-[80px] min-h-[60px] items-center gap-x-2">
            <LogoMobile/>
        </div>
        <div className="flex items-center gap-2">
            <ThemeSwitchBtn/>
            <UserButton afterSwitchSessionUrl='/sign-in'/>
        </div>
        </nav>
    </div>
)
}

function DesktopNavbar(){
    return(
        <div className="hidden 
        border-saparate border-b 
        bg-background md:block">
            <nav className="container flex items-center justify-between px-10">
                <div className="flex h-[80px] min-h-[60px] items-center gap-x-4">
                    <Logo/>
                    <div className="flex h-full">
                        {items.map(item => (
                            <NavbarItem 
                            key={item.label}
                            label={item.label}
                            link={item.link}

                            >

                            </NavbarItem>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <ThemeSwitchBtn/>
                    <UserButton afterSwitchSessionUrl='/sign-in'/>
                </div>
            </nav>
        </div>
    )
}

function NavbarItem({link,label,clickCallback}:{link:string,label:string,clickCallback ?:()=> void}){
    const pathname=usePathname();
    const isActive= pathname === link;

    return (
        <div className="relative flex items-center">
            <Link href={link} className={cn(buttonVariants({variant: "ghost"}),
            "w-full justify-start text-lg text-muted-foreground hover:text-foreground",
            isActive && "text-foreground"
        )}
        onClick={()=>{
            if(clickCallback) clickCallback();
        }}
        >{label}</Link>
        {
            isActive && (
                <div className="absolute -bottom-[2px] left-1/2 hidden h-[2px] w-[80%] -translate-x-1/2 rounded-xl bg-foreground md:block"/>
            )
        }
        </div>
    )
}
export default Navbar
