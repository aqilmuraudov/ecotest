// @vitest-environment jsdom
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { FIRST_CARDS, ProductCards, type ProductCard } from '../src/components/chat/ui';
import { STR } from '../src/components/chat/strings';

afterEach(() => cleanup());

const cards = (n: number): ProductCard[] =>
  Array.from({ length: n }, (_, i) => ({ code: `A${1000000 + i}`, slug: `p-${i}`, name: `Product ${i + 1}`, image: '', specs: { power: '10W', cct: '4000K' } }));

const show = (n: number) => render(<ProductCards items={cards(n)} favCodes={new Set()} t={STR.az} onFav={vi.fn()} onOpen={vi.fn()} />);
const names = () => screen.queryAllByText(/^Product \d+$/).map(e => e.textContent);

describe('chat product cards', () => {
  it('6 products: the first 3 are shown, the rest behind one button', () => {
    show(6);
    expect(FIRST_CARDS).toBe(3);
    expect(names()).toEqual(['Product 1', 'Product 2', 'Product 3']);
    fireEvent.click(screen.getByRole('button', { name: 'Daha 3 variant göstər' }));
    expect(names()).toEqual(['Product 1', 'Product 2', 'Product 3', 'Product 4', 'Product 5', 'Product 6']);
    expect(screen.queryByText(/Daha \d variant/)).toBeNull();
  });

  it('cards are numbered in order, so "the 2nd one" is unambiguous', () => {
    show(5);
    fireEvent.click(screen.getByRole('button', { name: 'Daha 2 variant göstər' }));
    for (let i = 1; i <= 5; i++) expect(screen.getByText(String(i))).toBeTruthy();
  });

  it.each([1, 2, 3, 4])('%i product(s): everything is shown, no button', n => {
    show(n);
    expect(names()).toHaveLength(n);
    expect(screen.queryByText(/variant göstər/)).toBeNull();
  });

  it('a single card has no number', () => {
    show(1);
    expect(screen.queryByText('1')).toBeNull();
  });

  it('the button text exists in every language', () => {
    expect(STR.ru.moreCards(3)).toBe('Ещё варианты (3)');
    expect(STR.en.moreCards(3)).toBe('Show 3 more options');
  });
});
