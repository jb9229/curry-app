export function handleJsonResponse(res) {
  if (res.ok) {
    if (res.status === 204) {
      // NO_CONTENTS
      return res;
    }

    return res.json();
  }

  const errorMessage = `${res.status}, ${res.statusText}, ${res.url}`;

  const error = new Error(errorMessage);
  error.response = res;
  throw error;
}

export function seconde() {}
