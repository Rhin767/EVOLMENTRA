import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic()

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
Duration: ${body.duration}
Date: ${new Date().toLocaleDateString()}
Observations: ${body.observations}
Write four sections: SUBJECTIVE, OBJECTIVE, ASSESSMENT, PLAN. Include CPT justification.`
  }

  if (body.type === 'goal') {
    prompt = `Write one SMART IEP goal for ABA therapy.
Target: ${body.description}
Write ONE SMART goal then add RATIONALE, TEACHING PROCEDURE, and MASTERY CRITERION.`
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
      system: SYSTEM,
      messages: [{ role: 'user', content: prompt }],
    })
    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    return NextResponse.json({ text })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
