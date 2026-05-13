import TranslatorTool from "@/components/TranslatorTool";

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontFamily: "'Nunito', sans-serif", fontSize: 42, fontWeight: 700, marginBottom: "1.5rem", letterSpacing: "-0.5px" }}>
        Baymax
      </h1>
      <TranslatorTool />
    </main>
  );
}