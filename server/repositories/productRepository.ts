import { BaseRepository } from './BaseRepository';

export class ProductRepository extends BaseRepository<any> {
  constructor() {
    super('products/products.json');
  }
}
export const productRepository = new ProductRepository();
