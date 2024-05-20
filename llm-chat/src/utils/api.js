export async function makeQuery(url = "", method, data) {
  const response = await fetch(url, {
    method,
    mode: "cors",
    cache: "no-cache",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "follow",
    referrerPolicy: "no-referrer",
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  if (!response.ok) {
    throw new Error(response.statusText);
  }
  return response;
}
