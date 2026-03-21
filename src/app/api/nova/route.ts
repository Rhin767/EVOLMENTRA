import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!
})

const SYSTEM = `You are NOVA, an AI clinical assistant embedded in EvolMentra, an ABA therapy platform.
You write professional, BACB-compliant clinical documentation.
Be specific, concise, and clinical. Use plain text sections — no markdown headers.
Always write in third person using the patient's name.`

export async function POST(req: NextRequest) {
  const body = await req.json()

  let prompt = ''

  if (body.type === 'soap') {
    prompt = `Write a complete ABA therapy SOAP note.

Patient: ${body.patient}
Diagnosis: ${body.diagnosis}
CPT Code: ${body.cptCode}
Session duration: ${body.duration}
Date: ${new Date().toLocaleDateString()}

What the therapist observed:
${body.observations}

Write the four sections: SUBJECTIVE, OBJECTIVE, ASSESSMENT, PLAN.
Include CPT code justification in the note. End with a brief plan for next session.
Be specific with data — include percentages, trial counts, and behaviors observed.`
  }

  if (body.type === 'goal') {
    prompt = `Write one SMART IEP goal for ABA therapy.

What the therapist wants to target:
${body.description}

Write ONE well-formed SMART goal with:
- Specific observable behavior
- Measurable criterion (% accuracy, number of sessions)  
- Time-bound specification
- BACB-compliant language in third person

Then add:
RATIONALE: (one sentence clinical rationale)
TEACHING PROCEDURE: (2 sentences on how to teach it)
MASTERY CRITERION: (specific data criterion)`
  }

  if (body.type === 'session_plan') {
    prompt = `Create a detailed ABA therapy session plan.

Patient: ${body.patient}
Session length: ${body.duration}
Focus: ${body.focus || 'General ABA programming'}

Create a minute-by-minute plan with time blocks, activity names, and specific therapist instructions.
Make it immediately usable. Include warm-up, 2-3 structured activities, movement break, and wrap-up.`
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }]
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ text })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
