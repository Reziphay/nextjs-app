"use client";

import { LanguageSwitcher, Logo } from "@/components";
import { useLocale } from "@/components/providers/locale-provider";

type HomePageProps = {
  apiBaseUrl: string;
};

const exampleRequest = `import { api } from "@/lib/api";

await api.get("/health");`;

export function HomePage({ apiBaseUrl }: HomePageProps) {
  const { messages } = useLocale();

  return (
    <main className="home">
      <section className="hero">
        <div className="heroTop">
          <div className="brandBlock">
            <Logo size={24} priority />
            <span className="eyebrow">{messages.hero.eyebrow}</span>
          </div>

          <LanguageSwitcher variant="segmented" />
        </div>

        <h1>{messages.hero.title}</h1>
        <p className="heroLead">{messages.hero.description}</p>

        <div className="infoGrid">
          <article className="infoCard">
            <span className="cardLabel">{messages.api.badge}</span>
            <h2>{messages.api.title}</h2>
            <p>{messages.api.description}</p>
            <code className="inlineCode">
              {apiBaseUrl || messages.api.missingBaseUrl}
            </code>
          </article>

          <article className="infoCard">
            <span className="cardLabel">{messages.example.badge}</span>
            <h2>{messages.example.title}</h2>
            <p>{messages.example.description}</p>
            <pre className="codeBlock">
              <code>{exampleRequest}</code>
            </pre>
          </article>
        </div>
      </section>
    </main>
  );
}
