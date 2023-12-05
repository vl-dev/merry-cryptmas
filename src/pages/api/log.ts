import { sql } from "@vercel/postgres";
import { NextApiRequest, NextApiResponse } from "next";

const vercel_env = process.env.VERCEL_ENV!

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const requestMethod = req.method
  switch (requestMethod) {
    case "POST":
      const { pubkey, total, gifts, strategy, txid } = req.body
      try {
        await sql`INSERT INTO logs (pubkey, tx_id, total, gifts, strategy, env)
                  VALUES (${pubkey}, ${txid}, ${total}, ${gifts}, ${strategy}, ${vercel_env})`
        res.status(200).send("OK")
      } catch (error) {
        console.error("Error: ", error)
        res.status(500).send("Error")
      }
      break;
    default:
      res.status(405).json({ message: `Method ${requestMethod} not allowed` })
  }
}
