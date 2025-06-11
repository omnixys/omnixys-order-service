import { type ValueTransformer } from 'typeorm';

export class DecimalTransformer implements ValueTransformer {
  /**
   * Transformation beim Schreiben in die DB
   */
  to(decimal?: number): string | undefined {
    return decimal?.toString();
  }

  /**
   * Transformation beim Lesen aus der DB
   */
  from(decimal?: string): number | undefined {
    return decimal === undefined ? undefined : Number(decimal);
  }
}
