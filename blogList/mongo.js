const config = require('./utils/config')
const logger = require('./utils/logger')
const mongoose = require('mongoose')

const url = config.MONGO_URI

mongoose.set('strictQuery',false)

mongoose.connect(url)

const blogSchema = new mongoose.Schema({
    title: String,
    author: String,
    url: String,
    likes: Number,
})

const Blog = mongoose.model('Blog', blogSchema)

// const blog = new Blog({
//     title: "The resume that got a software engineer a $300,000 job at Google.",
//     author: "Alexander Nguyen",
//     url: "https://medium.com/gitconnected/the-resume-that-got-a-software-engineer-a-300-000-job-at-google-8c5a1ecff40f",
//     likes: 2227
// })

// blog.save().then(result => {
//   console.log('blog saved!')
//   console.log(result)
//   mongoose.connection.close()
// })

Blog.find({}).then(result=>{
    result.forEach(blog=>{
        logger.info(blog)
    })
    mongoose.connection.close()
})