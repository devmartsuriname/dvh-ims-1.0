import { useState, useRef, useEffect, useCallback } from 'react'
import { Navigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardTitle, Row, Col, Button, Badge } from 'react-bootstrap'
import PageTitle from '@/components/PageTitle'
import { useUserRole } from '@/hooks/useUserRole'
import QRCode from 'qrcode'
import logoSozavo from '@/assets/images/logo-sozavo.png'

const ALLOWED_ROLES = ['system_admin', 'project_leader', 'minister', 'director'] as const

const PRODUCTION_DOMAIN = 'https://volkshuisvesting.sr'

interface QrConfig {
  id: string
  label: string
  path: string
  description: string
}

const QR_CONFIGS: QrConfig[] = [
  {
    id: 'woningregistratie',
    label: 'Woning Registratie',
    path: '/q/woningregistratie',
    description: 'Burger woning registratie formulier',
  },
  {
    id: 'bouwsubsidie',
    label: 'Bouwsubsidie Aanvraag',
    path: '/q/bouwsubsidie',
    description: 'Burger bouwsubsidie aanvraag formulier',
  },
]

const QR_SIZE = 3000
const QR_PREVIEW_SIZE = 280
const LOGO_RATIO = 0.2

const QrCodesPage = () => {
  const { loading, hasAnyRole } = useUserRole()

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-50">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (!hasAnyRole([...ALLOWED_ROLES])) {
    return <Navigate to="/dashboards" replace />
  }

  return (
    <>
      <PageTitle subName="Utilities" title="QR Codes" />
      <Row>
        {QR_CONFIGS.map((config) => (
          <Col lg={6} key={config.id}>
            <QrCard config={config} />
          </Col>
        ))}
      </Row>
      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader>
              <CardTitle as="h5">Print Richtlijnen</CardTitle>
            </CardHeader>
            <CardBody>
              <ul className="mb-0">
                <li><strong>Minimum formaat:</strong> 3 cm × 3 cm (print)</li>
                <li><strong>Aanbevolen posterformaat:</strong> A4 of A3</li>
                <li><strong>Fout correctie:</strong> Level H (30%) — logo overlay veilig</li>
                <li><strong>Quiet zone:</strong> Minimaal 4 modules rondom de QR code</li>
                <li><strong>Contrast:</strong> Zwart op wit — geen gekleurde achtergronden</li>
                <li><strong>Plaatsing:</strong> Gemeentekantoren, loketten, en overheidspublicaties</li>
              </ul>
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}

const QrCard = ({ config }: { config: QrConfig }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const printCanvasRef = useRef<HTMLCanvasElement>(null)
  const [svgString, setSvgString] = useState<string>('')
  const [logoImg, setLogoImg] = useState<HTMLImageElement | null>(null)
  const [ready, setReady] = useState(false)

  const fullUrl = `${PRODUCTION_DOMAIN}${config.path}`

  // Load logo
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      setLogoImg(img)
    }
    img.src = logoSozavo
  }, [])

  const drawLogoOnCanvas = useCallback((canvas: HTMLCanvasElement, img: HTMLImageElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const logoSize = canvas.width * LOGO_RATIO
    const x = (canvas.width - logoSize) / 2
    const y = (canvas.height - logoSize) / 2
    // White background circle behind logo
    const radius = logoSize / 2 + logoSize * 0.08
    ctx.beginPath()
    ctx.arc(canvas.width / 2, canvas.height / 2, radius, 0, Math.PI * 2)
    ctx.fillStyle = '#FFFFFF'
    ctx.fill()
    ctx.drawImage(img, x, y, logoSize, logoSize)
  }, [])

  // Generate QR codes once logo is loaded
  useEffect(() => {
    if (!logoImg) return

    const generateQr = async () => {
      // Preview canvas
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, fullUrl, {
          width: QR_PREVIEW_SIZE,
          margin: 2,
          errorCorrectionLevel: 'H',
          color: { dark: '#000000', light: '#FFFFFF' },
        })
        drawLogoOnCanvas(canvasRef.current, logoImg)
      }

      // Print canvas (3000px)
      if (printCanvasRef.current) {
        await QRCode.toCanvas(printCanvasRef.current, fullUrl, {
          width: QR_SIZE,
          margin: 4,
          errorCorrectionLevel: 'H',
          color: { dark: '#000000', light: '#FFFFFF' },
        })
        drawLogoOnCanvas(printCanvasRef.current, logoImg)
      }

      // SVG
      const svg = await QRCode.toString(fullUrl, {
        type: 'svg',
        width: QR_SIZE,
        margin: 4,
        errorCorrectionLevel: 'H',
        color: { dark: '#000000', light: '#FFFFFF' },
      })
      setSvgString(svg)
      setReady(true)
    }

    generateQr()
  }, [logoImg, fullUrl, drawLogoOnCanvas])

  const downloadPng = () => {
    if (!printCanvasRef.current) return
    const link = document.createElement('a')
    link.download = `qr_${config.id}.png`
    link.href = printCanvasRef.current.toDataURL('image/png')
    link.click()
  }

  const downloadJpg = () => {
    if (!printCanvasRef.current) return
    const link = document.createElement('a')
    link.download = `qr_${config.id}.jpg`
    link.href = printCanvasRef.current.toDataURL('image/jpeg', 0.95)
    link.click()
  }

  const downloadSvg = () => {
    if (!svgString) return
    const blob = new Blob([svgString], { type: 'image/svg+xml' })
    const link = document.createElement('a')
    link.download = `qr_${config.id}.svg`
    link.href = URL.createObjectURL(blob)
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h5">{config.label}</CardTitle>
      </CardHeader>
      <CardBody className="text-center">
        <p className="text-muted mb-2">{config.description}</p>
        <Badge bg="secondary" className="mb-3 font-monospace">{fullUrl}</Badge>

        <div className="mb-3">
          <canvas ref={canvasRef} style={{ maxWidth: '100%', height: 'auto' }} />
        </div>

        {/* Hidden print-resolution canvas */}
        <canvas ref={printCanvasRef} style={{ display: 'none' }} />

        <div className="d-flex justify-content-center gap-2 flex-wrap">
          <Button variant="primary" size="sm" disabled={!ready} onClick={downloadPng}>
            <i className="mdi mdi-download me-1" />PNG (3000px)
          </Button>
          <Button variant="outline-primary" size="sm" disabled={!ready} onClick={downloadJpg}>
            <i className="mdi mdi-download me-1" />JPG
          </Button>
          <Button variant="outline-primary" size="sm" disabled={!ready} onClick={downloadSvg}>
            <i className="mdi mdi-download me-1" />SVG
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}

export default QrCodesPage
