import { BaseRepository } from './BaseRepository';

export class AddressRepository extends BaseRepository<any> {
  constructor() {
    super('users/addresses.json');
  }
}
export const addressRepository = new AddressRepository();
