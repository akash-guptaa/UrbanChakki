import { BaseRepository } from './BaseRepository';

export class OrderRepository extends BaseRepository<any> {
  constructor() {
    super('orders/orders.json');
  }
}
export const orderRepository = new OrderRepository();
