export async function authFetch(url, method = "GET", body = null) {
  const token = localStorage.getItem("firebaseToken");
  // console.log("authFetch:", token)
  const options = {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const res = await fetch(url, options);
  const data = await res.json();
  // console.log(data)
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}
