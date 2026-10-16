export type CheckoutInput = {
  orderId: number;
  orderNumber: number;
  items: { title: string; quantity: number; unitPrice: number }[];
  shippingCost: number;
  payerEmail: string;
  payerName: string;
};

export type CheckoutResult = { redirectUrl: string; providerRef?: string };

/** Contrato que tiene que cumplir cualquier pasarela. Hoy: Mercado Pago. */
export interface PaymentProvider {
  id: string;
  /** false mientras falten credenciales: el checkout se frena antes de crear el pedido. */
  isConfigured(): boolean;
  createCheckout(input: CheckoutInput): Promise<CheckoutResult>;
}
