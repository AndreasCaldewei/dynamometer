import { Dynamometer } from '../Dynamometer';

export function defineDynamometerPlugin(
  plugin: (dynamometer: Omit<Dynamometer, 'use'>) => void
) {
  return plugin;
}
