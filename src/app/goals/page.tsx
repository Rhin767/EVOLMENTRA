'use client'
import { useRouter } from 'next/navigation'
export default function GoalsPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">🎯</div>
        <h1 className="text-xl font-bold mb-2">Goals</h1>
        <p className="text-gray-500 mb-4">Coming in next session — goals from NOVA AI SOAP notes</p>
        <button onClick={() => router.push('/notes')} className="btn btn-primary">Open NOVA →</button>
      </div>
    </div>
  )
}
