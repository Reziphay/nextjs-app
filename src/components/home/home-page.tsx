"use client";

import { localeLabels, locales } from "@/i18n/config";
import { useLocale } from "@/components/providers/locale-provider";

type HomePageProps = {
  apiBaseUrl: string;
};

const exampleRequest = `import { api } from "@/lib/api";

await api.get("/health");`;

export function HomePage({ apiBaseUrl }: HomePageProps) {
  const { locale, messages, setLocale } = useLocale();

  return (
    <main className="home">
      <section className="hero">
        <div className="heroTop">
          <span className="eyebrow">{messages.hero.eyebrow}</span>

          <nav
            className="languageNav"
            aria-label={messages.languageSwitcherAriaLabel}
          >
            {locales.map((entry) => {
              const isActive = entry === locale;

              return (
                <button
                  key={entry}
                  type="button"
                  className={`languageLink${isActive ? " isActive" : ""}`}
                  aria-pressed={isActive}
                  onClick={() => setLocale(entry)}
                >
                  {localeLabels[entry]}
                </button>
              );
            })}
          </nav>
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
