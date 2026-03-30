import { Router, type IRouter } from "express";
import multer from "multer";
import OpenAI from "openai";

const router: IRouter = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ["application/pdf", "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only PDF, Word (.doc/.docx), and text files are supported."));
    }
  }
});

const openai = new OpenAI({
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy",
});

async function extractTextFromBuffer(buffer: Buffer, mimetype: string): Promise<string> {
  if (mimetype === "text/plain") {
    return buffer.toString("utf-8");
  }

  if (mimetype === "application/pdf") {
    try {
      // pdf-parse v2.x uses a class-based API with { data: Buffer }
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buffer });
      const result = await parser.getText();
      return result.text;
    } catch (err: any) {
      throw new Error(`Failed to parse PDF: ${err?.message ?? String(err)}`);
    }
  }

  if (
    mimetype === "application/msword" ||
    mimetype === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const mammoth = (await import("mammoth")).default;
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } catch (err) {
      throw new Error("Failed to parse Word document.");
    }
  }

  throw new Error("Unsupported file type.");
}

const PARSE_PROMPT = `You are a resume parser. Extract structured information from the following resume/CV text and return a JSON object.

Return ONLY valid JSON, no markdown, no explanation. Use null for missing fields.

JSON schema to follow:
{
  "firstName": "string or null",
  "lastName": "string or null",
  "middleName": "string or null",
  "suffix": "string or null",
  "nickname": "string or null",
  "pronoun": "string or null — one of: He/Him, She/Her, They/Them, Prefer not to say — or null if not mentioned",
  "email": "string or null",
  "phoneAreaCode": "string — international dialing code like +63 or +1 — infer from phone number format or context, default to +1",
  "phoneNumber": "string — local phone number without country code",
  "permanentAddress": "string or null — full address",
  "currentAddress": "string or null — if different from permanent address",
  "facebookUrl": "string or null",
  "linkedinUrl": "string or null",
  "skills": ["array of up to 5 most prominent skills as plain strings"],
  "expectedSalary": "string or null — numeric amount only e.g. '50000'",
  "salaryNegotiable": true,
  "availabilityDate": "string or null — in YYYY-MM-DD format if found, otherwise null",
  "employmentHistory": [
    {
      "companyName": "string",
      "position": "string",
      "yearsStayed": "string — e.g. '2 years' or '2019-2021'",
      "reasonForLeaving": "string — infer from context or use 'Career Growth' as default"
    }
  ],
  "certificates": [
    {
      "name": "string",
      "issuingOrg": "string",
      "year": "string"
    }
  ],
  "references": []
}

Important rules:
- Extract real data only. Do not invent information.
- For skills, pick only the top 5 most relevant professional skills.
- For employmentHistory, list jobs in reverse chronological order.
- For certificates, include courses, trainings, licenses, and certifications. Limit to 3 max.
- Keep reasonForLeaving realistic (Career Growth, Better Opportunity, Contract Ended, Relocation, Personal Reasons, Company Closure, Layoff/Redundancy, Better Compensation, Work-Life Balance, Other).
- If a field cannot be determined from the text, use null.

RESUME TEXT:
`;

router.post("/parse", upload.single("resume"), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded." });
    return;
  }

  try {
    req.log.info({ filename: req.file.originalname, size: req.file.size }, "Parsing resume");

    // Step 1: Extract raw text
    const rawText = await extractTextFromBuffer(req.file.buffer, req.file.mimetype);

    if (!rawText || rawText.trim().length < 50) {
      res.status(400).json({ error: "Could not extract enough text from the file. Please try a different format." });
      return;
    }

    // Step 2: Use GPT to parse structured data
    const completion = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [
        {
          role: "user",
          content: PARSE_PROMPT + rawText.slice(0, 8000), // cap at 8k chars
        }
      ],
      response_format: { type: "json_object" },
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "AI parsing failed. Please try again." });
      return;
    }

    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(content);
    } catch {
      res.status(500).json({ error: "Failed to parse AI response. Please try again." });
      return;
    }

    // Step 3: Sanitize and return
    const result = {
      firstName: parsed.firstName ?? null,
      lastName: parsed.lastName ?? null,
      middleName: parsed.middleName ?? null,
      suffix: parsed.suffix ?? null,
      nickname: parsed.nickname ?? null,
      pronoun: parsed.pronoun ?? null,
      email: parsed.email ?? null,
      phoneAreaCode: parsed.phoneAreaCode ?? "+1",
      phoneNumber: parsed.phoneNumber ?? null,
      permanentAddress: parsed.permanentAddress ?? null,
      currentAddress: parsed.currentAddress ?? null,
      facebookUrl: parsed.facebookUrl ?? null,
      linkedinUrl: parsed.linkedinUrl ?? null,
      skills: Array.isArray(parsed.skills) ? (parsed.skills as string[]).slice(0, 5) : [],
      expectedSalary: parsed.expectedSalary ?? null,
      salaryNegotiable: parsed.salaryNegotiable !== false,
      availabilityDate: parsed.availabilityDate ?? null,
      employmentHistory: Array.isArray(parsed.employmentHistory) ? parsed.employmentHistory : [],
      certificates: Array.isArray(parsed.certificates) ? (parsed.certificates as unknown[]).slice(0, 3) : [],
      references: [],
    };

    req.log.info("Resume parsed successfully");
    res.json({ success: true, data: result });

  } catch (err: any) {
    req.log.error({ err }, "Resume parse error");
    res.status(500).json({ error: err.message || "Failed to process resume. Please try again." });
  }
});

export default router;
