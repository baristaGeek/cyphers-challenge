import type { NextApiRequest, NextApiResponse } from 'next'

type RequestData = {
  task_input: string
}

type ResponseData = {
  message: string
}

function parseInput(input: string): number[] {
  const match = input.match(/task_\[(.*?)\]/)
  if (!match) throw new Error('Invalid input format')
  return match[1].split(',').map(Number)
}

function asciiArrayToString(asciiArray: number[]): string {
  return String.fromCharCode(...asciiArray)
}

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === 'POST') {
    console.log("challenge 1 reached");
    const { task_input } = req.body as RequestData


    try {
      const ascii_array = parseInput(task_input)
      const convertedString = asciiArrayToString(ascii_array)
      res.status(200).json({ message: `task_${convertedString}` })
    } catch (error) {
      res.status(400).json({ message: 'Invalid input format' })
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' })
  }
}