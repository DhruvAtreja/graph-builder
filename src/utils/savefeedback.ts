// const FeedbackSchema = new mongoose.Schema({
//   // feedback
//   feedback: {
//     type: String,
//   },
//   updatedat: {
//     type: Date,
//     default: Date.now,
//   },
// })

export const savefeedback = async (feedback: string) => {
  const response = await fetch(`https://buzzgenius-backend.onrender.com/feedback`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ feedback }),
  })
}
