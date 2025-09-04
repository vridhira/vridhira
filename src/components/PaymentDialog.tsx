
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import type { PaymentMethod } from '@/lib/types';
import { useEffect } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';


const paymentSchema = z.object({
  id: z.string().optional(),
  cardType: z.string().min(1, 'Card type is required'),
  last4: z.string().length(4, 'Must be the last 4 digits'),
  expiryDate: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Invalid expiry date (MM/YY)'),
  isDefault: z.boolean().optional(),
});


interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (paymentMethod: PaymentMethod) => void;
  paymentMethod: PaymentMethod | null;
}

export function PaymentDialog({ isOpen, onClose, onSave, paymentMethod }: PaymentDialogProps) {
  const form = useForm<z.infer<typeof paymentSchema>>({
    resolver: zodResolver(paymentSchema),
     defaultValues: {
      id: '',
      cardType: 'Visa',
      last4: '',
      expiryDate: '',
      isDefault: false,
    },
  });

  useEffect(() => {
    if (paymentMethod) {
      form.reset(paymentMethod);
    } else {
      form.reset({
        id: '',
        cardType: 'Visa',
        last4: '',
        expiryDate: '',
        isDefault: false,
      });
    }
  }, [paymentMethod, form]);

  const onSubmit = (values: z.infer<typeof paymentSchema>) => {
    onSave(values as PaymentMethod);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{paymentMethod ? 'Edit Payment Method' : 'Add New Payment Method'}</DialogTitle>
          <DialogDescription>
            Your payment information is stored securely.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <FormField
              control={form.control}
              name="cardType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Card Type</FormLabel>
                   <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a card type" />
                        </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                            <SelectItem value="Visa">Visa</SelectItem>
                            <SelectItem value="Mastercard">Mastercard</SelectItem>
                            <SelectItem value="American Express">American Express</SelectItem>
                        </SelectContent>
                    </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="last4"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last 4 Digits</FormLabel>
                    <FormControl><Input placeholder="1234" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="expiryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl><Input placeholder="MM/YY" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="isDefault"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>
                      Make this my default payment method
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : 'Save Payment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
