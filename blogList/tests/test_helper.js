const Blog = require('../models/blog')

const initialBlogs = [{
    title: 'How to Use ChatGPT in Daily Life?',
    author: 'Tirendaz AI',
    url: 'https://medium.com/gitconnected/how-to-use-chatgpt-in-daily-life-4688f7afb930',
    likes: 7632,
},
{
    title: 'The resume that got a software engineer a $300,000 job at Google.',
    author: 'Alexander Nguyen',
    url: 'https://medium.com/gitconnected/the-resume-that-got-a-software-engineer-a-300-000-job-at-google-8c5a1ecff40f',
    likes: 2227,
}]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    initialBlogs,
    blogsInDb,
}