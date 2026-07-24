// Signature element: a small stack of "document" cards with a folded corner,
// evoking a Word document — quiet, in the brand's own blue, used once.
const DocumentMark = () => (
  <svg
    width="120"
    height="120"
    viewBox="0 0 120 120"
    fill="none"
    aria-hidden="true"
  >
    {/* Shadow */}
    <rect x="28" y="20" width="64" height="80" rx="6" fill="#173A6B" opacity="0.18" />

    {/* Notebook Cover */}
    <rect x="20" y="16" width="64" height="80" rx="6" fill="#2B579A" />

    {/* Left Binding */}
    <rect x="20" y="16" width="10" height="80" fill="#1E3F73" />

    {/* Spiral Rings */}
    {[24, 34, 44, 54, 64, 74, 84].map((y) => (
      <circle key={y} cx="25" cy={y} r="2.3" fill="#F4F4F4" />
    ))}

    {/* Page */}
    <rect x="30" y="20" width="50" height="72" rx="3" fill="#FFFFFF" />

    {/* Header */}
    <rect x="38" y="30" width="28" height="5" rx="2.5" fill="#8FB3E5" />

    {/* Ruled Lines */}
    <rect x="36" y="42" width="36" height="2" rx="1" fill="#C7D8F2" />
    <rect x="36" y="50" width="36" height="2" rx="1" fill="#C7D8F2" />
    <rect x="36" y="58" width="36" height="2" rx="1" fill="#C7D8F2" />
    <rect x="36" y="66" width="36" height="2" rx="1" fill="#C7D8F2" />
    <rect x="36" y="74" width="30" height="2" rx="1" fill="#C7D8F2" />
  </svg>
);

export default function AuthLayout({ eyebrow, title, subtitle, children, footer }) {
  return (
    <div className="min-h-screen w-full flex items-stretch justify-center px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden shadow-card bg-white">
        {/* Brand panel */}
        <div className="hidden lg:flex flex-col justify-between bg-word-gradient text-white p-10 relative overflow-hidden">
          <div>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/15 font-bold text-lg">ME</span>
              <span className="font-semibold tracking-wide">ME-Notes</span>
            </div>
          </div>

          <div className="motion-safe:animate-[fadeUp_0.6s_ease-out]">
            <DocumentMark />
            <h1 className="mt-6 text-2xl font-semibold leading-snug">
              Pick up right where{'\u00A0'}you left off.
            </h1>
            <p className="mt-3 text-word-100/90 text-sm leading-relaxed max-w-xs">
              ME-Notes is a simple, secure, and reliable note-taking app that helps you capture your thoughts and ideas anytime, anywhere.
            </p>
          </div>

          <p className="text-xs text-word-100/70">© {new Date().getFullYear()} ME-Notes</p>

          {/* subtle decorative circles, quiet and behind content */}
          <div className="pointer-events-none absolute -right-16 -bottom-16 h-56 w-56 rounded-full bg-white/5" />
          <div className="pointer-events-none absolute -right-4 top-1/3 h-24 w-24 rounded-full bg-white/5" />
        </div>

        {/* Form panel */}
        <div className="flex flex-col justify-center p-6 sm:p-10 bg-white">
          <div className="mx-auto w-full max-w-sm">
            {eyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-wider text-word-500 mb-2">{eyebrow}</p>
            ) : null}
            <h2 className="text-2xl font-semibold text-ink">{title}</h2>
            {subtitle ? <p className="mt-1.5 text-sm text-subtle">{subtitle}</p> : null}

            <div className="mt-7">{children}</div>

            {footer ? <div className="mt-6 text-center text-sm text-subtle">{footer}</div> : null}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}
