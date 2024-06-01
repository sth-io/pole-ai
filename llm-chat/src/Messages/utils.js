export const removePreviousGenerations = (chat) => {
  let aggregated = [];
  const deduped = chat.reduce((accumulator, next, index, data) => {
    const hasNext = data[index + 1];
    if (hasNext && next.role === data[index + 1].role) {
      aggregated.push(next);
      return accumulator;
    }
    const res = [...accumulator, { ...next, alternatives: [...aggregated] }];
    aggregated = []
    return res;
  }, []);
  return deduped;
};
