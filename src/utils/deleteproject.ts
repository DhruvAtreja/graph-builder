// app.delete("/project/:id"

export const deleteproject = async (id: string) => {
  const response = await fetch(`https://buzzgenius-backend.onrender.com/project/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  })
  console.log('response', response)
  const data = await response.json()
  return data
}
