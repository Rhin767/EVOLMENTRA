import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const SYSTEM = `You are NOVA, an AI clinical assistant embedded in EvolMentra, an ABA therapy platform.
You write professional, BACB-compliant clinical documentation.
Be specific, concise, and clinical. Use plain text section labels like SUBJECTIVE: — no markdown.
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

Write four sections labeled SUBJECTIVE, OBJECTIVE, ASSESSMENT, PLAN.
Include CPT code justification. End with a specific plan for next session.
Use data — percentages, trial counts, specific behaviors.`
  }

  if (body.type === 'goal') {
    prompt = `Write one SMART IEP goal for ABA therapy.

What the therapist wants to target:
${body.description}

Write ONE well-formed SMART goal. Then add:
RATIONALE: (one sentence)
TEACHING PROCEDURE: (two sentences)
MASTERY CRITERION: (specific data criterion)

Use third person. BACB-compliant language.`
  }

  if (body.type === 'session_plan') {
    prompt = `Create a detailed ABA therapy session plan.

Patient: ${body.patient}
Duration: ${body.duration}
Focus areas: ${body.focus || 'General ABA programming'}

Create a minute-by-minute plan with time blocks, activity names, and specific therapist instructions.
Include warm-up, 2-3 structured activities, movement break, wrap-up.`
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5-20251001',
      max_tokens: 1000,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ text })
  } catch (err: any) {
    console.error('NOVA API error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
