export const createuser = async (email: string) => {
  const user = {
    email: email,
    projects: [],
    history: [],
    payment: 'free',
    postsleft: 0,
  }
  if (email === 'srijanjain1207@gmail.com' || email === 'andrew@unitedwebworks.com') user.payment = 'individual'
  const response = await fetch(`https://buzzgenius-backend.onrender.com/createuser`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(user),
  })
  const data = await response.json()
  return data
}
