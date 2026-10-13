import { CheckIcon } from "../components/Icons";

export default function SubscriptionCard({
  plan,
  planIndex,
  isSelected,
  isIncludedInSelectedLevel,
  onSelect
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      onClick={() => onSelect(plan.name)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onSelect(plan.name);
        }
      }}
      className={`group relative flex h-full cursor-pointer flex-col rounded-3xl border p-5 text-left outline-none transition duration-300 hover:-translate-y-1 hover:border-brand-primary hover:bg-brand-primary/10 focus-visible:border-brand-primary focus-visible:ring-2 focus-visible:ring-brand-primary/40 ${
        isSelected
          ? "border-brand-primary bg-brand-primary/15 shadow-2xl shadow-brand-glow/25"
          : plan.highlighted
            ? "border-brand-primary/50 bg-brand-primary/10 shadow-xl shadow-brand-glow/10"
            : "border-brand-border bg-slate-950/55"
      }`}
    >
      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.22em] text-brand-primary">
            Nivå {planIndex + 1}
          </p>

          <h2 className="text-2xl font-black text-white">
            {plan.name}
          </h2>

          <p className="mt-2 text-sm leading-6 text-brand-muted">
            {plan.audience}
          </p>
        </div>

        {(plan.highlighted || isSelected) && (
          <span
            className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider ${
              isSelected
                ? "bg-white text-slate-950"
                : "bg-brand-primary text-brand-bg"
            }`}
          >
            {isSelected ? "Vald" : "Populär"}
          </span>
        )}
      </div>

      <div className="mb-5">
        <span className="text-3xl font-black text-white">
          {plan.price}
        </span>

        <span className="ml-1 text-sm font-bold text-brand-muted">
          {plan.period}
        </span>

        <p className="mt-2 rounded-xl border border-brand-border bg-black/25 px-3 py-2 text-xs font-bold text-brand-primary">
          {plan.hours}
        </p>

        <p className="mt-2 text-xs font-bold text-brand-muted">
          {plan.useCaseCount} valbara hjälpområden
        </p>
      </div>

      <ul className="mb-6 space-y-3">
        {plan.features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-brand-border bg-brand-primary/10 text-brand-primary">
              <CheckIcon className="h-3 w-3" />
            </span>

            <span
              className={`text-sm leading-6 ${
                isSelected
                  ? "text-white/90"
                  : "text-brand-muted"
              }`}
            >
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <div className="mt-auto">
        <div className="mb-5 rounded-2xl border border-brand-border bg-black/25 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-brand-primary">
            Passar dig som
          </p>

          <p className="mt-2 text-sm leading-6 text-white/85">
            {plan.fit}
          </p>
        </div>

        <a
          href={`/bli-medlem?plan=${encodeURIComponent(plan.name)}`}
          onClick={(event) => event.stopPropagation()}
          className={`block w-full rounded-xl px-4 py-3 text-center text-sm font-black transition active:scale-95 ${
            isSelected || plan.highlighted
              ? "bg-brand-primary text-brand-bg hover:bg-brand-primary-hover"
              : "border border-brand-border text-white hover:border-brand-primary hover:bg-brand-primary/10"
          }`}
        >
          Bli medlem
        </a>

        <p
          className={`mt-3 text-center text-[11px] font-bold ${
            isIncludedInSelectedLevel
              ? "text-brand-primary"
              : "text-brand-muted"
          }`}
        >
          {isIncludedInSelectedLevel
            ? "Ingår i vald nivå eller lägre"
            : "Klicka för att se fler val"}
        </p>
      </div>
    </div>
  );
}
