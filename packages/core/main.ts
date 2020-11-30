import TypeBase, { EntitySchema } from './typebase';
import * as User from './entities/User.json';
import * as Post from './entities/Post.json';

const run = async () => {
  const base = new TypeBase();

  const PostEntity = new EntitySchema(Post as any);
  const UserEntity = new EntitySchema(User as any);

  await base.registerEntities([UserEntity, PostEntity]);
};

run();
