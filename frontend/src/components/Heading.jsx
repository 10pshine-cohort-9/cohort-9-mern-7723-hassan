const Heading = ({ isOpen, toggleSidebar }) => {
  return (
    <header className="flex h-full items-center justify-between bg-word-gradient px-4 text-white shadow-md sm:px-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-white/15 text-sm font-bold">
          ME
        </span>
        <span className="font-semibold tracking-wide">ME-Notes</span>

        <button
          type="button"
          onClick={toggleSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md text-white transition-colors hover:bg-white/15 focus-visible:ring-2 focus-visible:ring-white md:hidden"
          aria-label={isOpen ? 'Close sidebar' : 'Open sidebar'}
          aria-expanded={isOpen}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" d={isOpen ? 'M6 18 18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'} />
          </svg>
        </button>
      </div>

      <h1 className="text-base font-semibold sm:text-lg">Dashboard</h1>
    </header>
  )
}

export default Heading
