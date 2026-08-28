import React from 'react';
import { ArrowRight, Sliders } from 'lucide-react';

interface ConfiguratorPromoSectionProps {
  title: string;
  subtitle: string;
  onStart: () => void;
}

/**
 * Home page configurator teaser.
 * Theme styling is intentionally self-contained so the light/dark appearance
 * cannot be broken by global text/background overrides elsewhere in the app.
 */
export const ConfiguratorPromoSection: React.FC<ConfiguratorPromoSectionProps> = ({
  title,
  subtitle,
  onStart,
}) => {
  return (
    <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="configurator-promo relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-14">
        <div className="configurator-promo__grid absolute inset-0 pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="configurator-promo__tag inline-flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs font-black uppercase tracking-wider">
              <Sliders className="w-3.5 h-3.5 configurator-promo__tag-icon" />
              <span>
                ECOLIFE CONFIGURATOR
                <span className="configurator-promo__pro"> PRO</span>
              </span>
            </div>

            <h2 className="configurator-promo__title text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              {title}
            </h2>

            <p className="configurator-promo__subtitle text-sm sm:text-base max-w-2xl leading-relaxed font-normal">
              {subtitle}
            </p>

            <div className="flex flex-wrap items-center gap-6 sm:gap-8 pt-2 text-xs sm:text-sm">
              <span className="configurator-promo__feature flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#FFD21A] shrink-0" />
                Ölçü və bucaq təyini
              </span>
              <span className="configurator-promo__feature flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#FFD21A] shrink-0" />
                CCT &amp; Optika seçimi
              </span>
              <span className="configurator-promo__feature flex items-center gap-2 font-medium">
                <span className="w-2 h-2 rounded-full bg-[#FFD21A] shrink-0" />
                Anında IES/PDF və qiymət
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex lg:justify-end">
            <button
              type="button"
              onClick={onStart}
              className="configurator-promo__button w-full sm:w-auto flex items-center justify-center gap-3 font-black text-xs sm:text-sm uppercase tracking-wider px-8 sm:px-9 py-4 rounded-xl transition-all shadow-[0_8px_25px_rgba(255,210,26,0.35)] hover:scale-105"
            >
              <span>KONFİQURATORU BAŞLAT</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .configurator-promo {
          background: linear-gradient(90deg, #14151B 0%, #101114 100%);
          border: 2px solid #FFD21A;
          box-shadow: 0 18px 45px -18px rgba(0, 0, 0, 0.55);
        }

        .configurator-promo__grid {
          opacity: 0.30;
          background-size: 40px 40px;
          background-image:
            linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
        }

        .configurator-promo__tag {
          color: #FFD21A;
          background: rgba(255, 210, 26, 0.10);
          border: 1px solid rgba(255, 210, 26, 0.55);
        }

        .configurator-promo__tag-icon,
        .configurator-promo__pro {
          color: #FFD21A;
        }

        .configurator-promo__title {
          color: #FFFFFF;
        }

        .configurator-promo__subtitle,
        .configurator-promo__feature {
          color: #D1D5DB;
        }

        .configurator-promo__button {
          background: #FFD21A;
          color: #000000;
        }

        .configurator-promo__button:hover {
          background: #F0C413;
        }

        /* Light mode is deliberately explicit and scoped to this component. */
        html.light .configurator-promo {
          background: #FFFFFF;
          border-color: #FFD21A;
          box-shadow:
            0 12px 36px -8px rgba(255, 210, 26, 0.16),
            0 4px 18px rgba(15, 23, 42, 0.05);
        }

        html.light .configurator-promo__grid {
          opacity: 0.38;
          background-image:
            linear-gradient(to right, rgba(15,23,42,0.025) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15,23,42,0.025) 1px, transparent 1px);
        }

        html.light .configurator-promo__tag {
          color: #0F172A;
          background: #FFFBEB;
          border-color: #FFD21A;
        }

        html.light .configurator-promo__tag-icon {
          color: #D97706;
        }

        html.light .configurator-promo__pro {
          display: none;
        }

        html.light .configurator-promo__title {
          color: #0F172A;
        }

        html.light .configurator-promo__subtitle,
        html.light .configurator-promo__feature {
          color: #334155;
        }
      `}</style>
    </section>
  );
};
