import { predictPrice } from '../../src/services/predictor';

describe('predictPrice', () => {
  describe('positive sentiment scenarios', () => {
    it('should calculate upward price change for positive sentiment', () => {
      const result = predictPrice(100, 10);
      expect(result).toBe(110.0);
    });

    it('should handle small positive sentiment values', () => {
      const result = predictPrice(1000, 1);
      expect(result).toBe(1010.0);
    });

    it('should handle large positive sentiment values', () => {
      const result = predictPrice(100, 50);
      expect(result).toBe(150.0);
    });
  });

  describe('negative sentiment scenarios', () => {
    it('should calculate downward price change for negative sentiment', () => {
      const result = predictPrice(100, -5);
      expect(result).toBe(95.0);
    });

    it('should handle small negative sentiment values', () => {
      const result = predictPrice(1000, -1);
      expect(result).toBe(990.0);
    });

    it('should handle large negative sentiment values', () => {
      const result = predictPrice(100, -25);
      expect(result).toBe(75.0);
    });
  });

  describe('neutral sentiment scenarios', () => {
    it('should return same price for zero sentiment', () => {
      const result = predictPrice(100, 0);
      expect(result).toBe(100.0);
    });

    it('should handle very small sentiment values', () => {
      const result = predictPrice(100, 0.1);
      expect(result).toBe(100.1);
    });
  });

  describe('decimal precision', () => {
    it('should round result to two decimal places', () => {
      const result = predictPrice(123.456, 1);
      expect(result).toBe(124.69);
    });

    it('should handle complex decimal calculations', () => {
      const result = predictPrice(999.999, 0.001);
      expect(result).toBe(1000.01);
    });

    it('should maintain precision for small prices', () => {
      const result = predictPrice(0.01, 100);
      expect(result).toBe(0.02);
    });
  });

  describe('edge cases', () => {
    it('should handle zero price', () => {
      const result = predictPrice(0, 10);
      expect(result).toBe(0.0);
    });

    it('should handle very large prices', () => {
      const result = predictPrice(1000000, 1);
      expect(result).toBe(1010000.0);
    });

    it('should handle extreme negative sentiment that would result in negative price', () => {
      const result = predictPrice(100, -150);
      expect(result).toBe(-50.0);
    });

    it('should handle fractional sentiment values', () => {
      const result = predictPrice(100, 2.5);
      expect(result).toBe(102.5);
    });
  });

  describe('mathematical accuracy', () => {
    it('should correctly apply percentage formula', () => {
      // 10% increase: 100 * (1 + 10/100) = 100 * 1.1 = 110
      const result = predictPrice(100, 10);
      expect(result).toBe(110.0);
    });

    it('should correctly handle compound calculations', () => {
      // Test that the formula currentPrice * (1 + avgSentiment/100) works correctly
      const basePrice = 50000;
      const sentiment = 2.5;
      const expected = parseFloat((basePrice * (1 + sentiment / 100)).toFixed(2));
      const result = predictPrice(basePrice, sentiment);
      expect(result).toBe(expected);
    });
  });
});