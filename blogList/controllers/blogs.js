const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({})
        res.json(blogs)
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.post('/', async (req, res) => {
    const body = req.body
    try {
        if (body.title && body.url) {
            const blog = new Blog({
                title: body.title,
                author: body.author,
                url: body.url,
                likes: body.likes || 0
            })
            const savedBlog = await blog.save()
            res.status(201).json(savedBlog)
        } else {
            res.status(400).end()
        }
    } catch (exception) {
        next(exception)
    }
})

module.exports = blogsRouter