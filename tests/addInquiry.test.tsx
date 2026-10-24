// @vitest-environment jsdom
import React from 'react';
import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

// DataProvider with Supabase, Turnstile and IndexedDB replaced by stubs; /api/lead is answered by a fetch stub.
const h = vi.hoisted(() => {
  const insert = vi.fn(async (_rows: unknown[]) => ({ error: null as null | { message: string } }));
  // chainable query stub: every method returns itself, awaiting it gives an empty result
  const chain = (): any => {
    const p: any = new Proxy(function () {}, {
      get: (_t, prop) => {
        if (prop === 'then') return (ok: any, fail: any) => Promise.resolve({ data: [], error: null, count: 0 }).then(ok, fail);
        if (prop === 'insert') return insert;
        return () => p;
      },
      apply: () => p,
    });
    return p;
  };
  const supabase = { from: vi.fn(() => chain()), channel: vi.fn(() => chain()), removeChannel: vi.fn() };
  return { insert, supabase, getTurnstileToken: vi.fn(async () => 'turnstile-test-token') };
});

vi.mock('../src/lib/supabase', () => ({ supabase: h.supabase }));
vi.mock('../src/lib/turnstile', () => ({ getTurnstileToken: h.getTurnstileToken, turnstileEnabled: true }));
vi.mock('../src/utils/indexedDBStorage', () => ({
  idbStorage: { getItem: async () => null, setItem: async () => true, removeItem: async () => true, clear: async () => true },
}));

import { DataProvider, useData } from '../src/context/DataContext';
import { MAX_TRIES, readOutbox, writeOutbox } from '../src/utils/inquiryOutbox';

const OUTBOX = 'ecolife_inquiry_outbox';
const form = { name: 'Aqil Test', phone: '050 450 70 07', email: '', message: 'Salam', source: 'contact-page' };

type LeadAnswer = { status: number; body?: unknown } | 'offline';

/** fetch stub for /api/lead; answers come from the queue (last one repeats). Any other URL throws. */
function mockLead(...answers: LeadAnswer[]) {
  const bodies: any[] = [];
  const fn = vi.fn(async (input: unknown, init?: RequestInit) => {
    if (String(input) !== '/api/lead') throw new Error(`Unexpected network request in a test: ${String(input)}`);
    bodies.push(JSON.parse(String(init?.body)));
    const a = answers.length > 1 ? answers.shift()! : answers[0];
    if (a === 'offline') throw new TypeError('Failed to fetch');
    return new Response(JSON.stringify(a.body ?? {}), { status: a.status, headers: { 'Content-Type': 'application/json' } });
  });
  vi.stubGlobal('fetch', fn);
  return { fn, bodies };
}

async function renderData() {
  const wrapper = ({ children }: { children: React.ReactNode }) => <DataProvider>{children}</DataProvider>;
  const view = renderHook(() => useData(), { wrapper });
  await waitFor(() => expect(view.result.current.isLoading).toBe(false));
  return view;
}

beforeEach(() => {
  localStorage.clear();
  h.insert.mockReset();
  h.insert.mockResolvedValue({ error: null });
  vi.spyOn(console, 'error').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
});

// without vitest globals Testing Library does not unmount by itself; a provider left mounted would keep its 'online' listener
afterEach(() => cleanup());

describe('addInquiry: refused at once', () => {
  it.each([['', 'empty'], ['A', 'one letter'], ['  B ', 'one letter with spaces']])('name %j (%s) -> {success:false, error:"name"}', async name => {
    const net = mockLead({ status: 200, body: { ok: true } });
    const { result } = await renderData();
    let r: any;
    await act(async () => { r = await result.current.addInquiry({ ...form, name }); });
    expect(r).toEqual({ success: false, error: 'name' });
    expect(net.fn).not.toHaveBeenCalled();
    expect(readOutbox()).toEqual([]);
    expect(result.current.inquiries).toEqual([]);
  });

  it.each(['12345', '', '+994 050 450 70 07', '1234567890123456', '050 450 70 0', '012345678'])('phone %j -> {success:false, error:"phone"}', async phone => {
    const net = mockLead({ status: 200, body: { ok: true } });
    const { result } = await renderData();
    let r: any;
    await act(async () => { r = await result.current.addInquiry({ ...form, phone }); });
    expect(r).toEqual({ success: false, error: 'phone' });
    expect(net.fn).not.toHaveBeenCalled();
    expect(readOutbox()).toEqual([]);
  });
});

describe('addInquiry: accepted at once, delivered in the background', () => {
  it('returns success before /api/lead has answered', async () => {
    let answer!: (r: Response) => void;
    const pending = new Promise<Response>(res => { answer = res; });
    const fn = vi.fn((_input: unknown, _init?: RequestInit) => pending);
    vi.stubGlobal('fetch', fn);
    const { result } = await renderData();

    let r: any;
    await act(async () => { r = await result.current.addInquiry(form); });
    expect(r).toEqual({ success: true });
    expect(result.current.inquiries[0]).toMatchObject({ name: 'Aqil Test', status: 'new' });
    await waitFor(() => expect(fn).toHaveBeenCalledTimes(1)); // still waiting on the server

    const body = JSON.parse(String(fn.mock.calls[0][1]!.body));
    expect(body).toMatchObject({ name: 'Aqil Test', phone: '050 450 70 07', source: 'contact-page', consent: true, cfToken: 'turnstile-test-token' });

    await act(async () => { answer(new Response(JSON.stringify({ ok: true }), { status: 200 })); });
    expect(readOutbox()).toEqual([]);
    expect(h.insert).not.toHaveBeenCalled();
  });

  it('derives the source when the form does not send one', async () => {
    const net = mockLead({ status: 200, body: { ok: true } });
    const { result } = await renderData();
    await act(async () => { await result.current.addInquiry({ ...form, source: undefined, configSummary: 'Room 20m2' }); });
    await act(async () => { await result.current.addInquiry({ ...form, phone: '0551234567', source: undefined, productCode: 'EL-1' }); });
    await act(async () => { await result.current.addInquiry({ ...form, phone: '0701234567', source: undefined }); });
    await waitFor(() => expect(net.bodies).toHaveLength(3));
    expect(net.bodies.map(b => b.source)).toEqual(['configurator', 'product', 'contact-form']);
  });
});

describe('addInquiry: background failures', () => {
  it('server 502 -> falls back to the direct insert; insert ok -> nothing queued', async () => {
    mockLead({ status: 502, body: { error: 'unavailable' } });
    const { result } = await renderData();
    await act(async () => { await result.current.addInquiry(form); });
    await waitFor(() => expect(h.insert).toHaveBeenCalledTimes(1));
    expect(h.insert.mock.calls[0][0]).toEqual([expect.objectContaining({ name: 'Aqil Test', status: 'new', email: '-' })]);
    expect(readOutbox()).toEqual([]);
  });

  it('server 502 and the insert fails -> queued in the outbox', async () => {
    mockLead({ status: 502, body: { error: 'unavailable' } });
    h.insert.mockResolvedValue({ error: { message: 'new row violates row-level security policy' } });
    const { result } = await renderData();
    let r: any;
    await act(async () => { r = await result.current.addInquiry(form); });
    expect(r).toEqual({ success: true });
    await waitFor(() => expect(readOutbox()).toHaveLength(1));
    expect(readOutbox()[0]).toMatchObject({ tries: 0, data: expect.objectContaining({ name: 'Aqil Test', phone: '050 450 70 07' }) });
  });

  it('offline (fetch throws) and the insert throws -> queued', async () => {
    mockLead('offline');
    h.insert.mockRejectedValue(new TypeError('Failed to fetch'));
    const { result } = await renderData();
    await act(async () => { await result.current.addInquiry(form); });
    await waitFor(() => expect(readOutbox()).toHaveLength(1));
  });

  it.each([[403, 'captcha'], [429, 'rate_limit']])('server %i -> no direct-insert bypass, queued for retry', async status => {
    mockLead({ status, body: { error: 'x' } });
    const { result } = await renderData();
    await act(async () => { await result.current.addInquiry(form); });
    await waitFor(() => expect(readOutbox()).toHaveLength(1));
    expect(h.insert).not.toHaveBeenCalled();
  });

  it('server 400 phone -> not queued, no direct insert', async () => {
    const net = mockLead({ status: 400, body: { error: 'phone' } });
    const { result } = await renderData();
    await act(async () => { await result.current.addInquiry(form); });
    await waitFor(() => expect(net.fn).toHaveBeenCalledTimes(1));
    await act(async () => { await Promise.resolve(); });
    expect(readOutbox()).toEqual([]);
    expect(h.insert).not.toHaveBeenCalled();
  });
});

describe('outbox retry (on load and when back online)', () => {
  const queued = (tries = 0) => ({ data: { ...form, name: `Queued ${tries}` }, at: Date.now(), tries });

  it('a queued inquiry is sent on load and removed when it goes through', async () => {
    writeOutbox([queued()]);
    const net = mockLead({ status: 200, body: { ok: true } });
    await renderData();
    await waitFor(() => expect(net.bodies).toHaveLength(1));
    expect(net.bodies[0].name).toBe('Queued 0');
    await waitFor(() => expect(readOutbox()).toEqual([]));
  });

  it('a failed retry stays with tries + 1; the last allowed try is dropped', async () => {
    writeOutbox([queued(0), queued(MAX_TRIES - 1)]);
    mockLead({ status: 403 });
    await renderData();
    await waitFor(() => expect(JSON.parse(localStorage.getItem(OUTBOX)!)).toHaveLength(1));
    expect(readOutbox()).toEqual([expect.objectContaining({ tries: 1, data: expect.objectContaining({ name: 'Queued 0' }) })]);
  });

  it('the "online" event retries the queue', async () => {
    const net = mockLead({ status: 200, body: { ok: true } });
    await renderData();
    expect(net.fn).not.toHaveBeenCalled();
    writeOutbox([queued()]);
    await act(async () => { window.dispatchEvent(new Event('online')); });
    await waitFor(() => expect(readOutbox()).toEqual([]));
    expect(net.bodies).toHaveLength(1);
  });
});
