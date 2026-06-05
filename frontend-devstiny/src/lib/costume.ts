const COSTUME_COUNT = 184;

/** Jika storedCostume ada (dari DB), pakai itu. Jika tidak, hash username. */
export function getUserCostume(username: string, storedCostume?: string | null): string {
  if (storedCostume) return `/costume/costume-${storedCostume}.png`;
  let h = 0;
  for (let i = 0; i < username.length; i++) {
    h = (h * 31 + username.charCodeAt(i)) & 0xffffffff;
  }
  const num = (Math.abs(h) % COSTUME_COUNT) + 1;
  return `/costume/costume-${num}.png`;
}

export { COSTUME_COUNT };
