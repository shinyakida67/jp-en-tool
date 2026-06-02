import TranslatorTool from "@/components/TranslatorTool";

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 26, fontWeight: 600, marginBottom: "1.25rem", letterSpacing: "-0.3px" }}>
        Baymax
      </h1>
      <TranslatorTool />
    </main>
  );
}