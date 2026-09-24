/**
 * AuthLayout — layout untuk halaman publik (/login, /forgot-password).
 * Centered card di atas background navy.
 */
function AuthLayout({ children }) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#0B1E3D',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: 12,
          padding: 40,
          width: '100%',
          maxWidth: 420,
          boxShadow: '0 4px 24px rgba(11,30,61,0.18)',
        }}
      >
        {children}
      </div>
    </div>
  )
}

export default AuthLayout
