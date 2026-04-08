import { BrandCard } from "@/components/molecules/brand-card";

export function BrandCardExample() {
  return (
    <BrandCard
      logo={{ src: "https://i.pravatar.cc/512?img=32", alt: "Example brand logo" }}
      backgroundImage={{
        src: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
        alt: "Mountain landscape at sunset",
      }}
      title="Exploring the Peaks of Kazbegi"
      description="A journey through the breathtaking highlands of Georgia, where ancient towers meet snow-capped mountains and the air carries stories of centuries past."
      category="Adventure"
      badgeText="Featured"
      author={{
        name: "Leyla Həsənova",
        avatar: "https://i.pravatar.cc/64?img=47",
      }}
      rating={2.5}
      maxRating={5}
      onClick={() => console.log("Card clicked")}
    />
  );
}
