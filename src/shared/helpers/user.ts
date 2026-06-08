import { DocumentType } from '@typegoose/typegoose';
import { UserEntity, DEFAULT_AVATAR_FILE_NAME } from '../modules/user/index.js';

export function prepareUser(user: DocumentType<UserEntity>) {
  const plain = user.toObject() as UserEntity;

  return {
    ...plain,
    id: String(user._id),
    avatarPath: plain.avatarPath ?? DEFAULT_AVATAR_FILE_NAME
  };
}
