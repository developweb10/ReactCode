export const serializeFilters = <T = {}>(filters: {}): T => {
  let serialized: { [key: string]: any } = {};
  Object.entries(filters).forEach(([key, value]: [any, any]) => {
    serialized[value.mapParamsProp] =
      value.appliedFilters.length > 0
        ? value.appliedFilters.map((v: any) => v.value)
        : undefined;
  });
  return serialized as T;
};
