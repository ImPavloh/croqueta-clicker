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

  validate(name?: string): UsernameValidationResult {
    if (!name) return { valid: false, reason: 'empty' };

    const cleaned = (name || '').trim();
    if (cleaned.length < this.MIN_LEN || cleaned.length > this.MAX_LEN)
      return { valid: false, reason: 'length' };

    if (!this.allowedRegex.test(cleaned)) return { valid: false, reason: 'format' };

    const lower = cleaned.toLowerCase();
    if (this.blacklist.has(lower)) return { valid: false, reason: 'banned' };

    if (this.repeatedPattern.test(cleaned)) return { valid: false, reason: 'weird' };

    return { valid: true };
  }
}
