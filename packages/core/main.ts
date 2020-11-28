import TypeBase, { EntitySchema } from './typebase-app';
import * as User from './entity/User.json';
import * as Post from './entity/Post.json';

const run = async () => {
  const base = new TypeBase();

  const PostEntity = new EntitySchema(Post as any);
  const UserEntity = new EntitySchema(User as any);

  await base.registerEntities([UserEntity, PostEntity]);

};

run();
