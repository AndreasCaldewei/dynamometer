export function delay() {
  return new Promise(resolve => {
    setTimeout(() => resolve(null), 200);
  });
}
