import { Button } from '@/components/ui/button';
import { prisma } from '@/lib/prisma';
import { currentUser } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation';
import React from 'react'
import { CreateTransactionDialog } from './_components/CreateTransactionDialog';
import Overview from './_components/Overview';
import History from './_components/History';

async function page() {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }
  const userSettings = await prisma.userSettings.findUnique({
    where: {
      userId: user.id,
    }
  });

  return (
    <div className='h-full bg-background'>
      <div className="borber-b bg-card">
        <div className="container flex flex-wrap items-center justify-between gap-6 py-4">
          <p className="text-2xl font-bold px-5">
            Welcome {user.firstName}!👋
          </p>
          <div className="flex item-center gap-3">
            <CreateTransactionDialog trigger={
              <Button variant={"outline"} className='border-emerald-500 bg-emerald-950 text-white hover:bg-emerald-700 hover:text-white'>
                New income🤑
              </Button>
            } type="income" />

            <CreateTransactionDialog trigger={
              <Button variant={"outline"} className='border-rose-500 bg-rose-950 text-white hover:bg-rose-700 hover:text-white'>
                New expense😤
              </Button>
            } type="expense" />


          </div>

        </div>
      </div>
      {userSettings && <Overview userSettings={userSettings} />}
      {userSettings && <History userSettings={userSettings} />}
    </div>
  )
}

export default page
