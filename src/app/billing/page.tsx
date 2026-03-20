'use client'
import { useRouter } from 'next/navigation'
export default function BillingPage() {
  const router = useRouter()
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="text-5xl mb-4">💳</div>
        <h1 className="text-xl font-bold mb-2">Billing</h1>
        <p className="text-gray-500 mb-4">Claims pipeline coming soon — will connect to Availity clearinghouse</p>
        <button onClick={() => router.push('/dashboard')} className="btn btn-secondary">← Dashboard</button>
      </div>
    </div>
  )
}
