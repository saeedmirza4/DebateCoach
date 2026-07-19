import Groq from "groq-sdk";
import { NextRequest, NextResponse } from "next/server";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(request: NextRequest) {
  try {
    const { stage, topic, side, userArgument, aiCounterArgument, difficulty } = await request.json();

    let prompt = "";

    if (stage === "arguments") {
      prompt = `You are a debate coach. The topic is: "${topic}". The user is arguing for the "${side}" side.
Generate 3 strong, convincing arguments for their side. Format as:
ARGUMENT 1: [title]
[2-3 sentence explanation]

ARGUMENT 2: [title]
[2-3 sentence explanation]

ARGUMENT 3: [title]
[2-3 sentence explanation]

Be clear, persuasive, and compelling.`;

    } else if (stage === "counter") {
      const difficultyInstruction = difficulty === "easy"
        ? "Be relatively gentle — present mild counter-arguments that are easy to rebut. Good for beginners."
        : difficulty === "hard"
        ? "Be absolutely brutal — attack every weakness mercilessly with sophisticated logic, statistics, and philosophical challenges. Make it very hard to respond."
        : "Be moderately aggressive — strong counter-arguments but fair and balanced.";

      prompt = `You are a debate opponent. The topic is: "${topic}". The user is arguing for the "${side}" side.
Their arguments were: ${userArgument}

Difficulty level: ${difficulty}. ${difficultyInstruction}

Generate 3 powerful counter-arguments attacking their position. Format as:
COUNTER 1: [title]
[2-3 sentence explanation]

COUNTER 2: [title]
[2-3 sentence explanation]

COUNTER 3: [title]
[2-3 sentence explanation]`;

    } else if (stage === "tips") {
      prompt = `You are a debate coach. The topic is: "${topic}".
The user is arguing "${side}" and faces these counter-arguments:
${userArgument}

Give 3 short, tactical tips on how to rebut these specific counter-arguments. Format as:
TIP 1: [one sentence — specific tactical advice]
TIP 2: [one sentence — specific tactical advice]
TIP 3: [one sentence — specific tactical advice]

Be direct and specific to these exact counter-arguments, not generic advice.`;

    } else if (stage === "score") {
      prompt = `You are a debate judge. The topic is: "${topic}". 
The AI attacked with these counter-arguments: ${aiCounterArgument}
The user responded with: ${userArgument}

Score the user's rebuttal out of 10 and give feedback. Format as:
SCORE: [X/10]

STRENGTHS:
[2-3 things they did well]

WEAKNESSES:
[2-3 things to improve]

VERDICT:
[2-3 sentence overall assessment]`;
    }

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 1024,
    });

    return NextResponse.json({
      result: completion.choices[0]?.message?.content || ""
    });

  } catch (error) {
    console.error("Groq error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}