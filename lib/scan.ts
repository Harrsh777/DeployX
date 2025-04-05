import { NextApiRequest, NextApiResponse } from "next";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fileName, fileContent } = req.body;

  if (!fileName || !fileContent) {
    return res.status(400).json({ error: "File name and content are required" });
  }

  const filePath = path.join("/tmp", fileName);
  fs.writeFileSync(filePath, fileContent, "utf8");

  exec(`clamscan ${filePath}`, (error, stdout) => {
    fs.unlinkSync(filePath); // Delete file after scanning

    if (error) {
      return res.status(500).json({ error: "Error scanning file" });
    }

    const isInfected = stdout.includes("FOUND");
    return res.json({ result: isInfected ? "Virus found" : "No vulnerabilities found", details: stdout });
  });
}
