export const trialreplies = async (trialproject: any) => {
  const response = await fetch(`https://buzzgenius-backend.onrender.com/trialreplies`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(trialproject),
  })
  const data = await response.json()
  return data
}
