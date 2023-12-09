export type Result = {
  vouchers: Voucher[],
  error?: string,
}

export type Voucher = {
  link?: string,
  error?: string,
}