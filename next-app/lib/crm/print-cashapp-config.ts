/**
 * Cash App configuration for 3D print CRM (NEXT_PUBLIC_* reads on server or client).
 *
 * - NEXT_PUBLIC_CASHAPP_PAYMENT_URL — profile / pay link (stored on lead as payment_link when applicable)
 * - NEXT_PUBLIC_CASHAPP_HANDLE — short handle for messages (e.g. $YourShop); falls back to URL
 */

export function printCashAppPaymentUrlFromEnv(): string | null {
  const u = process.env.NEXT_PUBLIC_CASHAPP_PAYMENT_URL?.trim();
  return u || null;
}

/** Line inserted into customer SMS/email copy — handle preferred, else payment URL. */
export function printCashAppDisplayLineFromEnv(): string | null {
  const h = process.env.NEXT_PUBLIC_CASHAPP_HANDLE?.trim();
  if (h) return h;
  return printCashAppPaymentUrlFromEnv();
}
