import { useState } from 'react'
import { Modal, Button, Form, Alert } from 'react-bootstrap'
import { supabase } from '@/integrations/supabase/client'
import { notify } from '@/utils/notify'
import IconifyIcon from '@/components/wrapper/IconifyIcon'
import { logAuditEvent } from '@/hooks/useAuditLog'

interface RunExecutorModalProps {
  show: boolean
  onHide: () => void
  onSuccess: () => void
}

const DISTRICTS = [
  { code: 'PAR', name: 'Paramaribo' },
  { code: 'WAG', name: 'Wanica' },
  { code: 'NIC', name: 'Nickerie' },
  { code: 'COR', name: 'Coronie' },
  { code: 'SAR', name: 'Saramacca' },
  { code: 'COM', name: 'Commewijne' },
  { code: 'MAR', name: 'Marowijne' },
  { code: 'PAA', name: 'Para' },
  { code: 'BRO', name: 'Brokopondo' },
  { code: 'SIP', name: 'Sipaliwini' },
]

const RunExecutorModal = ({ show, onHide, onSuccess }: RunExecutorModalProps) => {
  const [districtCode, setDistrictCode] = useState('')
  const [executing, setExecuting] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault()
    setExecuting(true)
    setResult(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        notify.error('Not authenticated')
        return
      }

      // 1. Create the allocation run record
      const { data: newRun, error: insertError } = await supabase
        .from('allocation_run')
        .insert({
          district_code: districtCode,
          run_status: 'pending',
          executed_by: user.id
        })
        .select()
        .single()

      if (insertError) {
        throw new Error('Failed to create allocation run: ' + insertError.message)
      }

      // 2. Call the edge function to execute the run
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await supabase.functions.invoke('execute-allocation-run', {
        body: {
          run_id: newRun.id,
          district_code: districtCode
        }
      })

      if (response.error) {
        throw new Error(response.error.message || 'Edge function failed')
      }

      const data = response.data

      if (data.success) {
        setResult({
          success: true,
          message: `Run completed: ${data.candidates_count} candidates processed, ${data.allocations_count} selected for allocation`
        })
        notify.success('Allocation run completed successfully')
        onSuccess()
      } else {
        throw new Error(data.error || 'Allocation run failed')
      }

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error'
      setResult({ success: false, message })
      notify.error('Allocation run failed: ' + message)
    } finally {
      setExecuting(false)
    }
  }

  const handleClose = () => {
    setDistrictCode('')
    setResult(null)
    onHide()
  }

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Execute Allocation Run</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleExecute}>
        <Modal.Body>
          {result && (
            <Alert variant={result.success ? 'success' : 'danger'} className="mb-3">
              {result.message}
            </Alert>
          )}

          <Form.Group className="mb-3">
            <Form.Label>District</Form.Label>
            <Form.Select
              value={districtCode}
              onChange={(e) => setDistrictCode(e.target.value)}
              required
              disabled={executing}
            >
              <option value="">Select district...</option>
              {DISTRICTS.map(d => (
                <option key={d.code} value={d.code}>{d.name} ({d.code})</option>
              ))}
            </Form.Select>
            <Form.Text className="text-muted">
              Select the district to run allocation for
            </Form.Text>
          </Form.Group>

          <Alert variant="info">
            <strong>Note:</strong> This will:
            <ul className="mb-0 mt-2">
              <li>Fetch all registrations on the waiting list for this district</li>
              <li>Rank candidates by urgency score and waiting position</li>
              <li>Select top candidates based on available quota</li>
            </ul>
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={executing}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={executing || !districtCode}>
            {executing ? (
              <>
                <span className="spinner-border spinner-border-sm me-1"></span>
                Executing...
              </>
            ) : (
              <>
                <IconifyIcon icon="mingcute:play-circle-line" className="me-1" />
                Execute Run
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}

export default RunExecutorModal
