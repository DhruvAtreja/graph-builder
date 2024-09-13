export const postandreplies = async (projectid: any) => {
  const response = await fetch(`https://buzzgenius-backend.onrender.com/postandreplies/${projectid}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  const data = await response.json()
  return data
}
