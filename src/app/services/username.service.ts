import { blacklist } from '@data/blacklist.data';
import { Injectable } from '@angular/core';

export type UsernameValidationResult = {
  valid: boolean;
  reason?: 'empty' | 'length' | 'format' | 'banned' | 'weird';
};

@Injectable({ providedIn: 'root' })
export class UsernameService {
  public readonly MIN_LEN = 3;
  public readonly MAX_LEN = 16;
  private readonly allowedRegex = /^[A-Za-z0-9_]+$/;
  private readonly repeatedPattern = /(.)\1{4,}/;
  private readonly blacklist = blacklist;

  // Normalizar texto para detectar variaciones de leetspeak
  private normalizeText(text: string): string {
    const leetMap: Record<string, string> = {
      '0': 'o',
      '1': 'i',
      '3': 'e',
      '4': 'a',
      '5': 's',
      '7': 't',
      '8': 'b',
      '@': 'a',
      $: 's',
      '!': 'i',
    };

    return text
      .toLowerCase()
      .split('')
      .map((char) => leetMap[char] || char)
      .join('');
  }

  private containsBannedWord(text: string): boolean {
    const normalized = this.normalizeText(text);

    if (this.blacklist.has(normalized)) return true;

    for (const banned of this.blacklist) {
      if (normalized.includes(banned)) return true;
    }

    return false;
  }

  validate(name?: string): UsernameValidationResult {
    if (!name) return { valid: false, reason: 'empty' };

    const cleaned = (name || '').trim();
    if (cleaned.length < this.MIN_LEN || cleaned.length > this.MAX_LEN)
      return { valid: false, reason: 'length' };

    if (!this.allowedRegex.test(cleaned)) return { valid: false, reason: 'format' };

    if (this.containsBannedWord(cleaned)) return { valid: false, reason: 'banned' };

    if (this.repeatedPattern.test(cleaned)) return { valid: false, reason: 'weird' };

    return { valid: true };
  }
}
