import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background:
            "linear-gradient(135deg, rgba(247,243,236,1) 0%, rgba(241,200,171,0.72) 100%)",
          color: "#1f1a17",
          fontFamily: "sans-serif",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            flex: 1,
            border: "1px solid rgba(198, 93, 26, 0.18)",
            borderRadius: "40px",
            background: "rgba(255, 253, 248, 0.82)",
            padding: "54px",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "72px",
                height: "72px",
                borderRadius: "20px",
                background: "#c65d1a",
                color: "white",
                fontSize: "34px",
                fontWeight: 700,
              }}
            >
              R
            </div>
            <div
              style={{
                fontSize: "26px",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#9d4410",
              }}
            >
              Reziphay
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            <div
              style={{
                fontSize: "68px",
                lineHeight: 1,
                fontWeight: 700,
                letterSpacing: "-0.04em",
                maxWidth: "860px",
              }}
            >
              Flexible reservations, built around real service workflows.
            </div>
            <div
              style={{
                fontSize: "28px",
                lineHeight: 1.45,
                color: "#5c5147",
                maxWidth: "820px",
              }}
            >
              Mobile-first discovery, provider visibility, and request-based booking
              flows without payment lock-in.
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}

