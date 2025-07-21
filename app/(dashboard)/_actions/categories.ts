
import { prisma } from "@/lib/prisma";
import { CreateCategorySchema, CreateCategorySchemaType, DeleteCategorySchema, DeleteCategorySchemaType } from "@/schema/categories";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


export async function CreateCategory(form: CreateCategorySchemaType) {
    const parseBody = CreateCategorySchema.safeParse(form);
    if (!parseBody.success) {
        throw new Error("Bad request")
    }
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in")
    }
    const { name, icon, type } = parseBody.data;
    return await prisma.category.create({
        data: {
            userId: user.id,
            name,
            icon,
            type,
        }
    })
}

export async function DeleteCategory(form: DeleteCategorySchemaType) {
    const parseBody = DeleteCategorySchema.safeParse(form);
    if (!parseBody.success) {
        throw new Error("Bad request")
    }
    const user = await currentUser();
    if (!user) {
        redirect("/sign-in")
    }
   const { name, type } = parseBody.data;

  // Step 1: Fetch all transactions of this category
  const transactions = await prisma.transaction.findMany({
    where: {
      userId: user.id,
      category: name,
      type,
    },
    select: {
      amount: true,
      date: true,
    },
  });

  // Step 2: Loop through each transaction to update month and year histories
  for (const tx of transactions) {
    const txDate = new Date(tx.date);
    const day = txDate.getUTCDate();
    const month = txDate.getUTCMonth();
    const year = txDate.getUTCFullYear();

    // Update MonthHistory
    await prisma.monthHistory.updateMany({
      where: {
        userId: user.id,
        day,
        month,
        year,
      },
      data: {
        [type]: {
          decrement: tx.amount,
        },
      },
    });

    // Update YearHistory
    await prisma.yearHistory.updateMany({
      where: {
        userId: user.id,
        month,
        year,
      },
      data: {
        [type]: {
          decrement: tx.amount,
        },
      },
    });
  }

  // Step 3: Delete all transactions under that category
  const deletedTransactions = await prisma.transaction.deleteMany({
    where: {
      userId: user.id,
      category: name,
      type,
    },
  });

  // Step 4: Delete the category
  const deletedCategory = await prisma.category.delete({
    where: {
      name_userId_type: {
        name,
        userId: user.id,
        type,
      },
    },
  });
     
     return {
    deletedTransactions,
    deletedCategory,
  };
    
}