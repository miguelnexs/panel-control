export const candidateApiBases = (): string[] => {
  // En producción usamos el dominio configurado
  return ['https://softwarebycg.shop', 'http://localhost:8000'];
};

const tryHealth = async (base: string): Promise<boolean> => {
  try {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 5000); 
    const res = await fetch(`${base.replace(/\/+$/,'')}/health/`, { signal: controller.signal });
    clearTimeout(id);
    if (!res.ok) return false;
    const data = await res.json().catch(() => null);
    return !!data && (data.status === 'ok' || data.database === true);
  } catch {
    return false;
  }
};

export const detectApiBase = async (): Promise<string> => {
  const bases = candidateApiBases();
  for (const b of bases) {
    const ok = await tryHealth(b);
    if (ok) return b.replace(/\/+$/,'');
  }
  // Forzar el dominio principal por defecto
  return 'https://softwarebycg.shop';
};
