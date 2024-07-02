export const removePreviousGenerations = (chat) => {
  let aggregated = [];
  const deduped = chat.reduce((accumulator, next, index, data) => {
    const hasNext = data[index + 1];
    if (hasNext && next.role === data[index + 1].role) {
      aggregated.push(next);
      return accumulator;
    }
    if (aggregated.length > 0) {
      const ready = [...aggregated, next];
      const chosen = ready.find((elem) => !elem.filtered) || next;
      const res = [...accumulator, { ...chosen, alternatives: ready }];
      aggregated = [];
      return res;
    }
    const res = [...accumulator, next];
      aggregated = [];
    return res;
  }, []);
  return deduped;
};
