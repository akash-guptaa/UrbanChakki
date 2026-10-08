import { BaseRepository } from './BaseRepository';

export class UserRepository extends BaseRepository<any> {
  constructor() {
    super('users/users.json');
  }
}
export const userRepository = new UserRepository();
