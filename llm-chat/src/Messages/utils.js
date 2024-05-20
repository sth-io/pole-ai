export const removePreviousGenerations = (chat) => {
  const deduped = chat.reduce((accumulator, next, index, data) => {
    const hasNext = data[index + 1];
    if (hasNext && next.role === data[index + 1].role) {
      return accumulator;
    }
    return [...accumulator, next];
  }, []);
  return deduped;
};
