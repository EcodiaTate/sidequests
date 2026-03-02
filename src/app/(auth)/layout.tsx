export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="min-h-screen-dvh flex items-center justify-center px-safe py-safe tx-dotgrid"
      style={{ background: "var(--ec-forest-950)" }}
    >
      <div className="w-full max-w-md px-4">
        {/* Branding */}
        <div className="text-center mb-8">
          <h1
            className="font-heading text-fluid-3xl uppercase tracking-widest"
            style={{
              color: "var(--ec-mint-400)",
              textShadow: "4px 4px 0 var(--ec-mint-800)",
            }}
          >
            ecodia
          </h1>
          <p
            className="stamp mt-2"
            style={{ color: "var(--ec-forest-500)", letterSpacing: "0.4em" }}
          >
            TURN ACTIONS INTO IMPACT
          </p>
        </div>

        {/* Auth card */}
        <div
          style={{
            background: "var(--ec-white)",
            border: "3px solid var(--ec-mint-500)",
            borderRadius: "var(--ec-r-lg)",
            boxShadow: "var(--neo-shadow-lg)",
            padding: "var(--space-4)",
          }}
        >
          {children}
        </div>

        {/* Bottom accent */}
        <div
          className="mt-6 mx-auto"
          style={{
            height: "3px",
            width: "40px",
            background: "var(--ec-mint-600)",
            boxShadow: "3px 3px 0 var(--ec-mint-900)",
          }}
        />
      </div>
    </div>
  );
}
