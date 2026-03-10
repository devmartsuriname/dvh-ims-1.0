import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

interface QrRedirectProps {
  qrType: 'woningregistratie' | 'bouwsubsidie'
  targetPath: string
}

const QrRedirect = ({ qrType, targetPath }: QrRedirectProps) => {
  const navigate = useNavigate()

  useEffect(() => {
    // Fire-and-forget tracking call
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID
    if (projectId) {
      fetch(`https://${projectId}.supabase.co/functions/v1/track-qr-scan`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_type: qrType }),
      }).catch(() => {
        // Silently fail — tracking must not block redirect
      })
    }

    // Immediate redirect
    navigate(targetPath, { replace: true })
  }, [qrType, targetPath, navigate])

  return null
}

export default QrRedirect
