import type { Messages } from "@/i18n/config";
import { AuthLayoutTemplate } from "@/components/templates";

type HomePageProps = {
  apiBaseUrl: string;
  messages: Messages;
};

const exampleRequest = `import { api } from "@/lib/api";

await api.get("/health");`;

export function HomePage({ apiBaseUrl, messages }: HomePageProps) {
  return (
    <AuthLayoutTemplate shellVariant="wide">
      <section className="home">
        <div className="heroTop">
          <span className="eyebrow">{messages.hero.eyebrow}</span>
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
    </AuthLayoutTemplate>
  );
}
