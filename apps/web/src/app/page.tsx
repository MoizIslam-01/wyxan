export default function Home() {
  return (
    <main className="grid min-h-screen place-items-center px-6">
      <section className="max-w-xl text-center">
        <p className="mb-4 font-mono text-sm uppercase tracking-[0.24em] text-slate-500">
          Connection established
        </p>
        <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-7xl">
          The Small Web
        </h1>
        <p className="mx-auto mt-6 max-w-md text-lg leading-8 text-slate-600">
          A quiet corner of the internet, written by strangers and explored one
          address at a time.
        </p>
        <div className="mt-10 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
          <div className="rounded-xl bg-slate-100 px-4 py-3 text-left font-mono text-sm text-slate-400">
            Enter an address soon…
          </div>
        </div>
      </section>
    </main>
  );
}
