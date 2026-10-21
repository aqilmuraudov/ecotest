import { Component, type ReactNode } from 'react';
import { isChunkLoadError, reloadOnce } from '../utils/lazyRetry';

interface Props {
  children: ReactNode;
  /** When this value changes (for example the page id) a shown error is cleared, so navigating away recovers. */
  resetKey?: string;
  /** Full-screen fallback (the root boundary) instead of an in-page one. */
  fullScreen?: boolean;
}

// the boundary sits above the language state, so it reads the language App writes on <html lang>
const TEXT = {
  az: ['Səhifə yüklənmədi', 'Bir problem baş verdi. Səhifəni yeniləyin və ya ana səhifəyə qayıdın.', 'Yenilə', 'Ana səhifə'],
  ru: ['Страница не загрузилась', 'Что-то пошло не так. Обновите страницу или вернитесь на главную.', 'Обновить', 'На главную'],
  en: ['The page did not load', 'Something went wrong. Reload the page or go back to the home page.', 'Reload', 'Home page'],
};

/** Catches render errors so one broken page no longer blanks the whole site. */
export class ErrorBoundary extends Component<Props, { error: Error | null }> {
  state: { error: Error | null } = { error: null };
  // this project has no @types/react, so the inherited members are declared here
  declare props: Readonly<Props>;
  declare setState: (s: { error: Error | null }) => void;

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    if (isChunkLoadError(error)) reloadOnce(); // an outdated bundle: load the current one
    else console.error('UI error:', error);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null });
  }

  render() {
    if (!this.state.error) return this.props.children;
    const [title, text, reload, home] = TEXT[document.documentElement.lang as keyof typeof TEXT] || TEXT.az;
    return (
      <div className={`${this.props.fullScreen ? 'min-h-screen' : 'min-h-[60vh]'} flex items-center justify-center px-6 py-24 text-center`} style={{ background: 'var(--ed-bg, #1d1d1b)', color: 'var(--ed-ivory, #f3efe6)' }}>
        <div className="max-w-sm">
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-sm opacity-70 mb-6">{text}</p>
          <div className="flex gap-3 justify-center">
            <button type="button" onClick={() => window.location.reload()} className="h-10 px-5 rounded-xl bg-[#FFD21A] text-black text-sm font-semibold">{reload}</button>
            <a href="/" className="h-10 px-5 rounded-xl border border-current/30 text-sm font-semibold inline-flex items-center opacity-80">{home}</a>
          </div>
        </div>
      </div>
    );
  }
}
