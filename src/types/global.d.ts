declare type Heading = {
  text?: string;
  id?: string;
  index?: number[];
  line?: number;
  children?: Heading[];
};

type CheckoutAndCustomer = {
  interval?: "day" | "month" | "week" | "year" | "one-time";
  currency: string;
  amount: number;
  purpose: string;
};

declare type Checkout = {
  domain: string;
  email: string;
} & CheckoutAndCustomer;

declare type Customer = {
  id: string;
  email: string | null;
  timestamp: any;
  customerId: string | null;
  created: number;
  canceled_at: number | null;
} & CheckoutAndCustomer;