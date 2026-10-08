import { BaseRepository } from './BaseRepository';

export class DeliveryRepository extends BaseRepository<any> {
  constructor() {
    super('delivery/deliveries.json');
  }
}
export const deliveryRepository = new DeliveryRepository();
