export type Result = {
  vouchers: Voucher[],
  error?: string,
}

export type Voucher = {
  link?: string,
  amount: number,
  error?: string,
}