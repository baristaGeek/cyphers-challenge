import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'

type ResponseData = {
  encrypted_path: string
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'GET') {
    try {
      const response = await axios.get('https://ciphersprint.pulley.com/estebanvargas94@gmail.com')
      const encryptedPath = response.data.encrypted_path

      res.status(200).json({ encrypted_path: encryptedPath })
    } catch (error) {
      res.status(500).json({ encrypted_path: 'Error fetching encrypted path' })
    }
  } else {
    res.status(405).json({ encrypted_path: 'Method not allowed' })
  }
}