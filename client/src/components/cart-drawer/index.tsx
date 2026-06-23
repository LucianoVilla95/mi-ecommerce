'use client';
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useUICartStore } from "@/stores/uicart.store";
import { JSX } from 'react';
import CartHeader from "./CartHeader";
import CartList from "./CartList";
import CartSummary from "./CartSummary";

const CartDrawer = ({isAuthenticated}: {isAuthenticated: boolean}): JSX.Element => {
  const { isOpen, setIsOpen } = useUICartStore();

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen} >
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col" aria-describedby={undefined}>
        <SheetTitle>
          <CartHeader isAuthenticated={isAuthenticated} />
        </SheetTitle>
        <CartList isAuthenticated={isAuthenticated} />
        <CartSummary isAuthenticated={isAuthenticated} />
      </SheetContent>
    </Sheet>
  );
}

export default CartDrawer;