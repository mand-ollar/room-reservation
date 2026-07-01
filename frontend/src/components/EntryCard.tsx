import { Link } from "react-router-dom";

type EntryCardVariant = "browse" | "user" | "admin";

type EntryCardProps = {
  to: string;
  label: string;
  variant: EntryCardVariant;
};

const EntryIcon = ({ variant }: { variant: EntryCardVariant }) => {
  if (variant === "browse") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="entry-card__icon-svg">
        <path
          d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M8 3.5V6M16 3.5V6M4 10h16"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  if (variant === "user") {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true" className="entry-card__icon-svg">
        <path
          d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <path
          d="M6.5 19.5c.9-2.6 3-4.5 5.5-4.5s4.6 1.9 5.5 4.5"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeWidth="1.5"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="entry-card__icon-svg">
      <path
        d="M7.5 11.5V8.8a4.5 4.5 0 0 1 9 0v2.7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
      <path
        d="M6.5 11.5h11a2 2 0 0 1 2 2v4.5a2 2 0 0 1-2 2h-11a2 2 0 0 1-2-2V13.5a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
};

export function EntryCard({ to, label, variant }: EntryCardProps) {
  return (
    <Link className="entry-card" to={to}>
      <span className="entry-card__icon">
        <EntryIcon variant={variant} />
      </span>
      <span className="entry-card__label">{label}</span>
      <span className="entry-card__arrow" aria-hidden="true">
        <svg viewBox="0 0 24 24" className="entry-card__arrow-svg">
          <path
            d="M9 6l6 6-6 6"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.75"
          />
        </svg>
      </span>
    </Link>
  );
}
