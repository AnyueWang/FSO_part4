const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
const middleware = require('../utils/middleware')

blogsRouter.get('/', async (req, res, next) => {
    try {
        const blogs = await Blog
            .find({})
            .populate('user', { username: 1, name: 1 })
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

blogsRouter.post('/', middleware.userExtractor, async (req, res, next) => {
    const body = req.body
    try {
        const user = req.user
        let blogInput = {
            title: body.title,
            author: body.author,
            url: body.url,
            likes: body.likes || 0,
        }
        if (user) { blogInput = { ...blogInput, user: user.id } }
        const blog = new Blog(blogInput)
        if (body.title && body.url) {
            const savedBlog = await blog.save()
            if (user) {
                user.blogs = user.blogs.concat(savedBlog.id)
                await user.save()
            }
            res.status(201).json(savedBlog)
        } else {
            res.status(400).end()
        }
    } catch (exception) {
        next(exception)
    }
})

blogsRouter.delete('/:id', middleware.userExtractor, async (req, res, next) => {
    const blogId = req.params.id
    const blog = await Blog.findById(blogId)
    try {
        const loginUser = req.user
        const loginUserId = loginUser.id
        const blogUserId = blog.user ? blog.user.toString() : false

        if (blogUserId === loginUserId) {
            await blog.deleteOne()
            return res.status(204).end()
        } else {
            return res.status(401).send({ error: 'you are unauthorized to delete the blog' })
        }

    } catch (exception) {
        next(exception)
    }
})

blogsRouter.put('/:id', middleware.userExtractor, async (req, res, next) => {
    const blogId = req.params.id
    const blog = await Blog.findById(blogId)
    try {
        const loginUser = req.user
        const loginUserId = loginUser.id
        const blogUserId = blog.user ? blog.user.toString() : false
        if (blogUserId === loginUserId) {
            const result = await Blog.findByIdAndUpdate(blogId, {...req.body, user:loginUserId}, { new: true })
            res.json(result)
        } else {
            return res.status(401).send({ error: 'you are unauthorized to delete the blog' })
        }
    } catch (exception) {
        next(exception)
    }
})

module.exports = blogsRouter