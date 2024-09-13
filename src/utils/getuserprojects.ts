export const getuserprojects = async (userid: string) => {
  const response = await fetch(`https://buzzgenius-backend.onrender.com/userprojects/${userid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return data
}
