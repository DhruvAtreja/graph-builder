// send email to https://buzzgenius-backend.onrender.com/verifyemail

//api endpoint with params token and email

export const signin = async (token: string) => {
  const response = await fetch(`https://buzzgenius-backend.onrender.com/signin?token=${token}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  return response.json()
}
