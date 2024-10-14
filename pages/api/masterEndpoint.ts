import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { decode } from 'base64-arraybuffer';
import * as msgpack from '@msgpack/msgpack';
import * as crypto from 'crypto';

type ResponseData = {
  final_message: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  if (req.method === "GET") {
    try {
      // LEVEL 0
      const response1 = await axios.get(
        "https://ciphersprint.pulley.com/estebanvargas94@gmail.com"
      );
      const encryptedPath1 = response1.data.encrypted_path;
      console.log("encryptedPath1: ", encryptedPath1);

      // LEVEL 1
      const response2 = await axios.get(
        `https://ciphersprint.pulley.com/${encryptedPath1}`
      );
      const encryptedPath2 = response2.data.encrypted_path;

      // decrypt
      const parseEncryptedPath2 = (encryptedPath2: string): string => {
        const match = encryptedPath2.match(/\[([\d,]+)\]/);
        if (!match) return encryptedPath2;

        const asciiValues = match[1].split(",").map(Number);
        const decodedChars = asciiValues.map((ascii) =>
          String.fromCharCode(ascii)
        );
        const decodedString = decodedChars.join("");

        return encryptedPath2.replace(/\[[\d,]+\]/, decodedString);
      };

      // Usage in masterEndpoint
      const parsedPath = parseEncryptedPath2(encryptedPath2);

      // Step 4: Make the final GET request
      const finalResponse = await axios.get(
        `https://ciphersprint.pulley.com/${parsedPath}`
      );

      const level1Answer =
        finalResponse.data.encrypted_path || "No message received";
      // console.log("level1Answer: ", level1Answer);

      // res.status(200).json({ final_message: finalMessage });

      // LEVEL 2
      const level2Decryption = level1Answer
        .replace(/^(task_)/, "") // temporarily remove "task_"
        .replace(/[^0-9a-f]/gi, "") // remove non-hex characters
        .replace(/^/, "task_"); // add "task_" back to the beginning

      const level2Answer = await axios.get(
        `https://ciphersprint.pulley.com/${level2Decryption}`
      );

      // res.status(200).json({ final_message: "level 2 completed!" });

      const level2RotationLevel =
        level2Answer.data.encryption_method.split(" ");
      const level2Rotation =
        level2RotationLevel[level2RotationLevel.length - 1];


      // LEVEL 3
      const rotateLeft = (str: string, n: number) => {
        const rotation = n % str.length;
        return str.slice(rotation) + str.slice(0, rotation);
      };

      const rotateRight = (str: string, n: number) => {
        const rotation = n % str.length;
        return str.slice(-rotation) + str.slice(0, -rotation);
      };

      const level2AnswerString = level2Answer.data.encrypted_path.slice(5); // Remove 'task_'
      const rotatedString = rotateRight(
        level2AnswerString,
        parseInt(level2Rotation)
      );
      const level3Decryption = "task_" + rotatedString;

      const level3Answer = await axios.get(
        `https://ciphersprint.pulley.com/${level3Decryption}`
      );

      // res.status(200).json({ final_message: "level 3 completed!" });

      // LEVEL 4
      const customHexBase = level3Answer.data.encryption_method.split(" ");
      const customHexBaseString = customHexBase[customHexBase.length - 1];
      const standardHex = "0123456789abcdef";

      const hexMapping = Object.fromEntries(
        customHexBaseString
          .split("")
          .map((char: any, index: any) => [char, standardHex[index]])
      );
      const encryptedPath = level3Answer.data.encrypted_path;

      const level4Decryption =
        "task_" +
        encryptedPath
          .slice(5)
          .split("")
          .map((char: any) => hexMapping[char] || char)
          .join("");


      const level4Answer = await axios.get(
        `https://ciphersprint.pulley.com/${level4Decryption}`
      );


      // res.status(200).json({ final_message: "level 4 completed!" });

      // LEVEL 5
      console.log("level4Answer: ", level4Answer.data);

      const lastPositionLevel4 = level4Answer.data.encryption_method.split(" ");


      // Decode the base64 MessagePack data
      const base64Instructions = lastPositionLevel4[lastPositionLevel4.length - 1];
      const decodedInstructions = Buffer.from(base64Instructions, 'base64');
      const unscrambleInstructions = msgpack.decode(new Uint8Array(decodedInstructions)) as any;
      console.log("unscrambleInstructions: ", unscrambleInstructions);

      // Remove 'task_' prefix and convert to byte array
      const l4encryptedPath = level4Answer.data.encrypted_path.slice(5); // Remove 'task_' prefix
      
      
      
      
      // Create position mapping
      // const positionMapping = {} as any;
      // unscrambleInstructions.forEach((val: string | number, index: any) => {
      //     positionMapping[val] = index;
      // });
      // console.log("positionMapping: ", positionMapping);
      
      
      
      const encryptedBytes = new Uint8Array(Buffer.from(l4encryptedPath, 'hex'));
      console.log("encryptedBytes: ", encryptedBytes);

      // Unscramble the data
      const unscrambledData = new Uint8Array(encryptedBytes.length);
      // console.log("unscrambledData: ", unscrambledData);
      for (let i = 0; i < encryptedBytes.length; i++) {
        unscrambledData[unscrambleInstructions[i]] = encryptedBytes[i];

        // const newPosition = unscrambleInstructions[i];
        // unscrambledData[newPosition] = encryptedBytes[i];
    }
    
    const decodedHex = Buffer.from(unscrambledData).toString('hex');

      console.log("decodedHex: ", decodedHex);
      const compressHex = (hex: string): string => {
        return hex.replace(/([0-9a-f])\1+/g, (match, char) => {
            return char + (match.length > 1 ? match.length.toString(16) : '');
        });
    };
    
    const compressedHex = compressHex(decodedHex);
    console.log("compressedHex: ", compressedHex);
      const finalDecryption = 'task_' + compressedHex;

      console.log("final decryption: ", finalDecryption);


      const level5Answer = await axios.get(
        `https://ciphersprint.pulley.com/task_${finalDecryption}`
      );

      console.log("level5Answer: ", level5Answer.data);

      res.status(200).json({ final_message: "level 5 completed!" });
    } catch (error) {
      res.status(500).json({ final_message: "Error in challenge process" });
    }
  } else {
    res.status(405).json({ final_message: "Method not allowed" });
  }
}
