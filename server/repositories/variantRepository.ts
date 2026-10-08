import { BaseRepository } from './BaseRepository';

export class VariantRepository extends BaseRepository<any> {
  constructor() {
    super('products/variants.json');
  }
}
export const variantRepository = new VariantRepository();
