// In development, vite proxy server responds with status code 500 (Internal server error) and an empty json body when the backend is down. This causes `res.json()` to throw. Hence this function safely handles this
export async function safeParseJson(res) {
  let result = {};

  if (!res.ok) {
    try {
      const json = await res.json();
      result = json;
    } catch {
      // the backend is down and vite proxy has returned status code 500
      throw new Error("Server error");
    }

    // the backend is up and it is the one that returned a failed response eg 500, 400, 404
    throw new Error(result.message);
  } else {
    // no errors happened
    result = await res.json();
  }

  return result;
}
