const blogsRouter = require('express').Router()
const Blog = require('../models/blog')

blogsRouter.get('/', async (req, res, next) => {
    try {
        const blogs = await Blog.find({})
        res.json(blogs)
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.get('/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        const blog = await Blog.findById(id)
        if (blog) {
            res.json(blog)
        } else {
            res.status(404).end()
        }
        
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.post('/', async (req, res, next) => {
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

blogsRouter.delete('/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        await Blog.findByIdAndDelete(id)
        res.status(204).end()
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.put('/:id', async (req, res, next) => {
    const id = req.params.id
    try {
        const result = await Blog.findByIdAndUpdate(id, req.body, { new: true })
        res.json(result)
    } catch (exception) {
        next(exception)
    }
})

module.exports = blogsRouter