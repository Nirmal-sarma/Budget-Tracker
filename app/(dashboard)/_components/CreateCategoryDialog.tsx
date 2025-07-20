import { Button } from '@/components/ui/button';
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { TransactionType } from '@/lib/types'
import { cn } from '@/lib/utils';
import { CreateCategorySchema, CreateCategorySchemaType } from '@/schema/categories';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleOff, Loader2, PlusSquare } from 'lucide-react';
import React, { ReactNode, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form';
import EmojiPicker,{Theme} from 'emoji-picker-react'
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CreateCategory } from '../_actions/categories';
import { Category } from '@/lib/generated/prisma';
import { toast } from 'sonner';
import { useTheme } from 'next-themes';


interface Props {
    type: TransactionType,
    successCallback: (category: Category) => void,
    trigger?: ReactNode

}

function CreateCategoryDialog({ type, successCallback, trigger }: Props) {
    const [open, setOpen] = useState(false);
    const form = useForm<CreateCategorySchemaType>({
        resolver: zodResolver(CreateCategorySchema),
        defaultValues: {
            type
        }
    })
    const queryClient = useQueryClient()
    const theme = useTheme()
    const { mutate, isPending } = useMutation({
        mutationFn: CreateCategory,
        onSuccess: async (data: Category) => {
            form.reset({
                name: "",
                icon: "",
                type,
            })
            toast.success(`Category ${data.name} created successfully🎉`, {
                id: "create-category"
            })
            successCallback(data)
            await queryClient.invalidateQueries({
                queryKey: ["categories"]
            })
            setOpen(prev => !prev)
        },
        onError: () => {
            toast.error("Something went wrong", {
                id: "create-category"
            });
        }

    })

    const onSubmit = useCallback((values: CreateCategorySchemaType) => {
        toast.loading("Creating category....", {
            id: "create-category",
        })
        mutate(values)
    }, [mutate])

const emojiTheme: Theme =
  theme.resolvedTheme === "dark"
    ? Theme.DARK
    : theme.resolvedTheme === "light"
    ? Theme.LIGHT
    : Theme.AUTO;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger ? trigger : (<Button variant={"ghost"} className='flex border-separate items-center justify-start rounded-none border-b px-3 py-3 text-muted-foreground'>
                    <PlusSquare className='mr-2 h-4 w-4' />
                    Create new
                </Button>)}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        Create <span className={cn("m-1", type === "income" ? "text-emrald-500" : "text-red-500")}>
                            {type}
                        </span>
                        category
                    </DialogTitle>
                    <DialogDescription>
                        Categories are used to group your transactions
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>
                                        Name
                                    </FormLabel>
                                    <FormControl>
                                        <Input placeholder="Category" {...field} />
                                    </FormControl>
                                    <FormDescription>
                                        This is how your category will look like
                                    </FormDescription>
                                </FormItem>


                            )}
                        />

                        <FormField
                            control={form.control}
                            name="icon"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Icon</FormLabel>
                                    <FormControl>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button variant="outline" className="flex flex-col h-[100px] w-full justify-center items-center gap-2">
                                                    <CircleOff className="h-[48px] w-[48px]" />

                                                    {field.value ? (
                                                        <div className="flex flex-col items-center gap-1">
                                                            <span className="text-3xl" role="img">
                                                                {field.value}
                                                            </span>
                                                            <p className="text-xs text-muted-foreground">Click to Change</p>
                                                        </div>
                                                    ) : (
                                                        <p className="text-xs text-muted-foreground">Click to Select</p>
                                                    )}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent
                                                side="bottom"
                                                align="center"
                                                className="w-[350px] max-h-[400px] overflow-y-auto z-50"
                                            >
                                                <EmojiPicker
                                                    theme={emojiTheme}
                                                    onEmojiClick={(emojiData) => {
                                                        field.onChange(emojiData.emoji)
                                                    }}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </FormControl>
                                    <FormDescription>
                                        This is how your category will appear in the app
                                    </FormDescription>
                                </FormItem>
                            )}
                        />
                    </form>
                </Form>

                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant={"secondary"}
                            onClick={() => form.reset()}
                        >

                            Cancel
                        </Button>
                    </DialogClose>
                    <Button onClick={form.handleSubmit(onSubmit)} disabled={isPending}>
                        {!isPending && "Create"}
                        {isPending && <Loader2 className='animate-spin' />}
                    </Button>

                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default CreateCategoryDialog
