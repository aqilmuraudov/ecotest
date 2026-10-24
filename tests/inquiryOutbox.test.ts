// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MAX_TRIES, queueInquiry, readOutbox, writeOutbox, type QueuedInquiry } from '../src/utils/inquiryOutbox';

const KEY = 'ecolife_inquiry_outbox';
const HOUR = 60 * 60 * 1000;
const data = { name: 'Aqil Test', phone: '0504507007', message: 'test' };

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers({ toFake: ['Date'] });
  vi.setSystemTime(new Date('2026-10-24T10:00:00Z'));
});

describe('queueInquiry', () => {
  it('stores the request with tries = 0 and the current time', () => {
    queueInquiry(data);
    expect(readOutbox()).toEqual([{ data, at: Date.now(), tries: 0 }]);
  });

  it('appends to what is already queued', () => {
    queueInquiry(data, 'Network error');
    queueInquiry({ ...data, name: 'Second' }, 'captcha');
    expect(readOutbox().map(q => q.data.name)).toEqual(['Aqil Test', 'Second']);
  });

  it.each(['name', 'phone'])('does not queue a "%s" refusal (the same data would be refused again)', error => {
    queueInquiry(data, error);
    expect(readOutbox()).toEqual([]);
    expect(localStorage.getItem(KEY)).toBeNull();
  });

  it.each([undefined, 'captcha', 'rate_limit', 'consent', 'Network error', 'unavailable'])('queues other failures (%s)', error => {
    queueInquiry(data, error);
    expect(readOutbox()).toHaveLength(1);
  });

  it('drops expired entries when it writes', () => {
    queueInquiry(data);
    vi.setSystemTime(Date.now() + 25 * HOUR);
    queueInquiry({ ...data, name: 'Fresh' });
    const raw: QueuedInquiry[] = JSON.parse(localStorage.getItem(KEY)!);
    expect(raw.map(q => q.data.name)).toEqual(['Fresh']);
  });
});

describe('readOutbox', () => {
  it('returns [] when nothing is stored', () => {
    expect(readOutbox()).toEqual([]);
  });

  it('keeps entries younger than 24 hours and hides older ones', () => {
    const now = Date.now();
    writeOutbox([
      { data: { name: 'fresh' }, at: now - 23 * HOUR, tries: 0 },
      { data: { name: 'edge' }, at: now - 24 * HOUR, tries: 0 },
      { data: { name: 'old' }, at: now - 25 * HOUR, tries: 0 },
    ]);
    expect(readOutbox().map(q => q.data.name)).toEqual(['fresh']);
  });

  it('hides entries that reached MAX_TRIES', () => {
    const now = Date.now();
    writeOutbox([
      { data: { name: 'last-try' }, at: now, tries: MAX_TRIES - 1 },
      { data: { name: 'spent' }, at: now, tries: MAX_TRIES },
      { data: { name: 'over' }, at: now, tries: MAX_TRIES + 1 },
    ]);
    expect(readOutbox().map(q => q.data.name)).toEqual(['last-try']);
  });

  it('MAX_TRIES is 3', () => {
    expect(MAX_TRIES).toBe(3);
  });

  it('skips broken entries and survives corrupt JSON', () => {
    localStorage.setItem(KEY, JSON.stringify([null, { at: Date.now(), tries: 0 }, { data, at: Date.now(), tries: 0 }]));
    expect(readOutbox()).toHaveLength(1);
    localStorage.setItem(KEY, '{not json');
    expect(readOutbox()).toEqual([]);
  });

  it('returns [] when storage is unavailable', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
    expect(readOutbox()).toEqual([]);
  });
});

describe('writeOutbox', () => {
  it('round-trips through localStorage', () => {
    const list = [{ data, at: Date.now(), tries: 1 }];
    writeOutbox(list);
    expect(JSON.parse(localStorage.getItem(KEY)!)).toEqual(list);
  });

  it('does not throw when storage is full or blocked', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('QuotaExceededError'); });
    expect(() => writeOutbox([{ data, at: Date.now(), tries: 0 }])).not.toThrow();
    expect(() => queueInquiry(data)).not.toThrow();
  });
});
