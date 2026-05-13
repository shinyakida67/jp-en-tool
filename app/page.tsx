import TranslatorTool from "@/components/TranslatorTool";

export default function Home() {
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: "2rem 1rem" }}>
      <h1 style={{ fontSize: 20, fontWeight: 500, marginBottom: "1.5rem" }}>
        Baymax
      </h1>
      <TranslatorTool />
    </main>
  );
}