export async function getMonggoUserProfile(token) {

    // Fetch user profile from your backend
      const res = await fetch(`${import.meta.env.VITE_APP_API_URL}/users/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // console.log(res);
      if (!res.ok) {
        throw new Error("Failed to fetch user profile");
      }


}