import { v4 as uuidv4 } from 'uuid';
import { isFunction } from 'lodash';

export const createUUID = (uuid?: () => string): string => {
  if (isFunction(uuid)) return uuid();

  return uuidv4();
};
