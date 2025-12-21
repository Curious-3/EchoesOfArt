import fs from "fs";
import path from "path";

export const generateTagsFromImage = async ({
  imagePath,
  title = "",
  description = "",
}) => {
  try {
    // read image
    const imageBuffer = fs.readFileSync(imagePath);

    // detect mime type
    const ext = path.extname(imagePath).toLowerCase();
    const mimeType =
      ext === ".png"
        ? "image/png"
        : ext === ".webp"
        ? "image/webp"
        : "image/jpeg";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inlineData: {
                    mimeType,
                    data: imageBuffer.toString("base64"),
                  },
                },
                {
                  text: `
You are an AI for an art platform.
Analyze the image carefully and generate 5 to 7 relevant tags.
Use visual content first, then title/description if helpful.

Title: ${title}
Description: ${description}

Rules:
- lowercase
- comma separated
- no explanations
- no hashtags
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return text
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  } catch (error) {
    console.error("❌ Gemini image tag generation failed:", error.message);
    return [];
  }
};


// ✍️ WRITING / TEXT TAG GENERATION (GEMINI)
export const generateTagsFromText = async ({
  title = "",
  content = "",
}) => {
  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are an AI for a writing platform.
Analyze the following writing and generate 5 to 7 relevant tags.

Title: ${title}
Content: ${content}

Rules:
- lowercase
- 1 or 2 words max per tag
- comma separated
- no explanations
- no hashtags
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return text
      .split(",")
      .map((t) => t.trim().toLowerCase())
      .filter(Boolean);
  } catch (error) {
    console.error("❌ Gemini text tag generation failed:", error.message);
    return [];
  }
};


// 🚫 COMMENT MODERATION (LEVEL 2 - SOFT MODERATION)
export const moderateCommentWithGemini = async (commentText = "") => {
  try {
    if (!commentText.trim()) return "SAFE";

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `
You are an AI content moderation system.
Analyze the following user comment and classify it.

Possible outputs (ONLY ONE WORD):
SAFE
OFFENSIVE
HATE
SEXUAL
HARASSMENT

Comment:
"${commentText}"

Rules:
- Respond with ONLY one word
- No explanation
                  `,
                },
              ],
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      throw new Error(err);
    }

    const data = await response.json();
    const result =
      data.candidates?.[0]?.content?.parts?.[0]?.text || "SAFE";

    return result.trim().toUpperCase();
  } catch (error) {
    console.error("❌ Gemini comment moderation failed:", error.message);
    return "SAFE"; // fail-safe
  }
};
