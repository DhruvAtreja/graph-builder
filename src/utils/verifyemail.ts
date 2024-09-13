// send email to https://buzzgenius-backend.onrender.com/verifyemail

export const verifyemail = async (email: string) => {
  console.log('email', email)
  const response = await fetch('https://buzzgenius-backend.onrender.com/verifyemail', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email: email }),
  })
  return response.text()
}
