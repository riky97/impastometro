export const CONTAINER_IDS = ['cassettine', 'monoporzione'] as const;
export type ContainerId = (typeof CONTAINER_IDS)[number];

export const CONTAINERS: Record<ContainerId, { id: ContainerId; label: string }> = {
  cassettine: { id: 'cassettine', label: 'Cassettine' },
  monoporzione: { id: 'monoporzione', label: 'Mono-porzione' },
};
