const Blog = require('../models/blog')
const User = require('../models/user')

const rootuser = {
    username: 'rootuser',
    password: 'IamAPassword'
}

const usersInDb = async () => {
    const users = await User
        .find({})
        .populate('blogs', {
            title: 1,
            author: 1,
            url: 1,
            likes: 1,
        })
    return users.map(user => user.toJSON())
}

const initialBlogs = async () => {
    const user = await User.findOne({username:rootuser.username})
    return [{
        title: 'How to Use ChatGPT in Daily Life?',
        author: 'Tirendaz AI',
        url: 'https://medium.com/gitconnected/how-to-use-chatgpt-in-daily-life-4688f7afb930',
        likes: 7632,
        user: user._id.toString()
    },
    {
        title: 'The resume that got a software engineer a $300,000 job at Google.',
        author: 'Alexander Nguyen',
        url: 'https://medium.com/gitconnected/the-resume-that-got-a-software-engineer-a-300-000-job-at-google-8c5a1ecff40f',
        likes: 2227,
        user: user._id.toString()
    }]
}

const blogsInDb = async () => {
    const blogs = await Blog
        .find({})
        .populate('user', { username: 1, name: 1 })
    return blogs.map(blog => blog.toJSON())
}

module.exports = {
    rootuser,
    initialBlogs,
    blogsInDb,
    usersInDb,
}