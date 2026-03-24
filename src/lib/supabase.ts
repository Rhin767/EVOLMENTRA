import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://vcrssnbmdxoankhkiwhp.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZjcnNzbmJtZHhvYW5raGtpd2hwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4MTIzOTAsImV4cCI6MjA4OTM4ODM5MH0.EZ6pPT6j3I_1nlYDTdzPHZaZdhtwET1fbRfT8Nb7Bso'
  )
}
