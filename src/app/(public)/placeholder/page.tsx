/**
 * Placeholder page for public route verification
 * This will be replaced with Landing Page in Checkpoint 3
 */
const PublicPlaceholder = () => {
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100">
      <div className="text-center p-4">
        <h1 className="mb-3">VolksHuisvesting Suriname</h1>
        <p className="text-muted mb-4">
          Publieke diensten voor volkshuisvesting
        </p>
        <div className="d-flex flex-column gap-2">
          <span className="badge bg-success">Public Layout Active</span>
          <span className="badge bg-info">Light Theme Scoped</span>
        </div>
        <hr className="my-4" />
        <p className="small text-muted">
          Checkpoint 1 Verification: If you see this page with light styling,
          the PublicLayout is working correctly.
        </p>
      </div>
    </div>
  )
}

export default PublicPlaceholder
