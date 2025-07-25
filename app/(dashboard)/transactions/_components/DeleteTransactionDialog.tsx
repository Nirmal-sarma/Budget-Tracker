"use client"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import React from 'react'
import { toast } from 'sonner';
import { DeleteTransaction } from '../_actions/deleteTransaction';

interface Props {
    open: boolean,
    setOpen: (open: boolean) => void,
    transactionId: string,
}
const DeleteTransactionDialog = ({ open, setOpen, transactionId }: Props) => {
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: DeleteTransaction,
        onSuccess: async () => {
            toast.success("Transaction deleted successfully", {
                id: transactionId,
            });

            await queryClient.invalidateQueries({
                queryKey: ["Transaction"]
            });
        },
        onError: () => {
            toast.error("Something went wrong", {
                id: transactionId,
            });
        }
    });

    return (
        <AlertDialog open={open} onOpenChange={setOpen}>

            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        Are you absolutely sure?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This action cannot be undone.
                        This will permanently delete your transaction.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>
                        Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={() => {
                        toast.loading("Deleting transaction...", {
                            id: transactionId,
                        })
                        deleteMutation.mutate(transactionId);
                    }}>Continue</AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}




export default DeleteTransactionDialog
