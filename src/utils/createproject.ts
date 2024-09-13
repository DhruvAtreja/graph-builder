export const createproject = async (project: any) => {
  //   user: {
  //     type: String,
  //   },
  //   projectname: {
  //     type: String,
  //   },
  //   productname: {
  //     type: String,
  //   },
  //   productlink: {
  //     type: String,
  //   },
  //   productdescription: {
  //     type: String,
  //   },
  //   postfilter: {
  //     type: String,
  //   },
  //   subreddits: {
  //     type: String,
  //   },
  //   keywords: {
  //     type: String,
  //   },
  //   postandreplyids: {
  //     type: Array,
  //   },
  //   updatedat: {
  //     type: Date,
  //     default: Date.now,
  //   },
  const proj = {
    user: project.user,
    projectname: project.projectname,
    productname: project.productname,
    productlink: project.productlink,
    productdescription: project.productdescription,
    postfilter: project.postfilter,
    subreddits: project.subreddits,
    keywords: project.keywords,
    postandreplyids: [],
    updatedat: Date.now(),
  }
  const data = await fetch(`https://buzzgenius-backend.onrender.com/createproject`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(proj),
  })

  const res = await data.json()
  return res
}
