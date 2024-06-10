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
//     title: "How to Use ChatGPT in Daily Life?",
//     author: "Tirendaz AI",
//     url: "https://medium.com/gitconnected/how-to-use-chatgpt-in-daily-life-4688f7afb930",
//     likes: 7632
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