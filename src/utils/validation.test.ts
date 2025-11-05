// src/utils/validation.test.ts
import { describe, it, expect } from 'vitest';

/**
 * Validates that a ticket ID is a 4-digit number between 1000 and 9999
 */
export const validateTicketId = (value: any, isEditing: boolean = false): boolean | string => {
  if (!value && !isEditing) {
    return 'El ID del ticket es obligatorio.';
  }
  if (value) {
    const numValue = typeof value === 'string' ? parseInt(value, 10) : value;
    if (isNaN(numValue)) {
      return 'El ID debe ser un número.';
    }
    if (numValue.toString().length !== 4) {
      return 'El ID debe ser un número de exactamente 4 dígitos.';
    }
    if (numValue < 1000 || numValue > 9999) {
      return 'El ID debe estar entre 1000 y 9999.';
    }
  }
  return true;
};

describe('validateTicketId', () => {
  describe('when creating a new ticket (isEditing = false)', () => {
    it('should return error if value is empty', () => {
      const result = validateTicketId(undefined, false);
      expect(result).toBe('El ID del ticket es obligatorio.');
    });

    it('should return error if value is null', () => {
      const result = validateTicketId(null, false);
      expect(result).toBe('El ID del ticket es obligatorio.');
    });

    it('should return error if value is not a number', () => {
      const result = validateTicketId('abc', false);
      expect(result).toBe('El ID debe ser un número.');
    });

    it('should return error if value has less than 4 digits', () => {
      expect(validateTicketId(123, false)).toBe('El ID debe ser un número de exactamente 4 dígitos.');
      expect(validateTicketId(12, false)).toBe('El ID debe ser un número de exactamente 4 dígitos.');
      expect(validateTicketId(1, false)).toBe('El ID debe ser un número de exactamente 4 dígitos.');
    });

    it('should return error if value has more than 4 digits', () => {
      expect(validateTicketId(12345, false)).toBe('El ID debe ser un número de exactamente 4 dígitos.');
      expect(validateTicketId(123456, false)).toBe('El ID debe ser un número de exactamente 4 dígitos.');
    });

    it('should return error if value is less than 1000', () => {
      // 999 has 3 digits, so it fails length check first
      expect(validateTicketId(999, false)).toBe('El ID debe ser un número de exactamente 4 dígitos.');
      expect(validateTicketId(100, false)).toBe('El ID debe ser un número de exactamente 4 dígitos.');
      // 0999 would be a string edge case, but as a number it's 999
      // Test with a 4-digit number less than 1000 (leading zeros not possible with numbers)
      // Actually, any number less than 1000 has less than 4 digits, so length check comes first
    });

    it('should return error if value is greater than 9999', () => {
      expect(validateTicketId(10000, false)).toBe('El ID debe ser un número de exactamente 4 dígitos.');
    });

    it('should return true for valid 4-digit IDs', () => {
      expect(validateTicketId(1000, false)).toBe(true);
      expect(validateTicketId(1234, false)).toBe(true);
      expect(validateTicketId(5678, false)).toBe(true);
      expect(validateTicketId(9999, false)).toBe(true);
    });

    it('should accept string numbers and convert them', () => {
      expect(validateTicketId('1234', false)).toBe(true);
      expect(validateTicketId('1000', false)).toBe(true);
      expect(validateTicketId('9999', false)).toBe(true);
    });
  });

  describe('when editing an existing ticket (isEditing = true)', () => {
    it('should return true if value is empty (ID cannot be changed)', () => {
      const result = validateTicketId(undefined, true);
      expect(result).toBe(true);
    });

    it('should still validate if a value is provided', () => {
      expect(validateTicketId(1234, true)).toBe(true);
      expect(validateTicketId(123, true)).toBe('El ID debe ser un número de exactamente 4 dígitos.');
    });
  });
});

