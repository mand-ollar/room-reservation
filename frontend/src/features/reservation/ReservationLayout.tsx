import { useState } from "react";

import { useAuth } from "@/lib/auth/useAuth";

import { LocationPicker } from "./LocationPicker";
import { ReservationSchedule } from "./ReservationSchedule";

type ReservationLayoutProps = {
  title: string;
  mode?: "public" | "admin";
};

export function ReservationLayout({
  title,
  mode = "public",
}: ReservationLayoutProps) {
  const { user } = useAuth();
  const [selectedSpaceId, setSelectedSpaceId] = useState<string | null>(null);

  return (
    <section className="reservation-page">
      <header className="reservation-page__header">
        <h1 className="page-title">{title}</h1>
      </header>

      <div className="reservation-layout">
        <aside className="reservation-layout__locations">
          <LocationPicker
            selectedSpaceId={selectedSpaceId}
            onSpaceSelect={setSelectedSpaceId}
          />
        </aside>

        <main className="reservation-layout__schedule">
          <ReservationSchedule
            spaceId={selectedSpaceId}
            currentUserName={user?.name ?? null}
            mode={mode}
          />
        </main>
      </div>
    </section>
  );
}
