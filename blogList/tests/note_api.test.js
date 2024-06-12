const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')

const api = supertest(app)

const initialBlogs = helper.initialBlogs

beforeEach(async () => {
    await Blog.deleteMany({})
    const blogObjects = initialBlogs.map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(object => object.save())
    await Promise.all(promiseArray)
})

describe('fecth data from MongoDB:', () => {
    test('list is returned as json', async () => {
        await api
            .get('/api/blogs')
            .expect(200)
            .expect('Content-Type', /application\/json/)
    })

    test('there are two blogs', async () => {
        const res = await api.get('/api/blogs')
        assert.strictEqual(res.body.length, 2)
    })

    test('a blog is about ChatGPT', async () => {
        const res = await api.get('/api/blogs')
        const titles = res.body.map(e => e.title)
        assert(titles.includes('How to Use ChatGPT in Daily Life?'))
    })

    test('unique identifier property of blogs is named id instead of _id', async () => {
        const res = await api.get('/api/blogs')
        res.body.forEach(e => {
            assert(e.hasOwnProperty('id'))
            assert(!e.hasOwnProperty('_id'))
        })
    })
})

describe('add data to MongoDB:', () => {
    test('add a new blog to DB', async () => {
        const blog = {
            title: 'Steve Jobs Believed This One Thing Separated the Doers From the Dreamers',
            author: 'Nimish Jalan',
            url: 'https://medium.com/@nimishjalan/steve-jobs-believed-this-one-thing-separated-the-doers-from-the-dreamers-083fa0ff947b',
            likes: 1863
        }
        await api
            .post('/api/blogs')
            .send(blog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const updatedBlogs = await helper.blogsInDb()
        assert.strictEqual(updatedBlogs.length, initialBlogs.length + 1)
        assert.strictEqual(updatedBlogs.at(-1).title, blog.title)
    })

    test('default of likes property is set to 0', async () => {
        const blog = {
            title: 'This is a blog I wrote',
            author: 'Anyue Wang',
            url: 'https://anyue.wang/blogs/1',
        }
        await api
            .post('/api/blogs')
            .send(blog)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const updatedBlogs = await helper.blogsInDb()
        assert.strictEqual(updatedBlogs.length, initialBlogs.length + 1)

        addedBlog = updatedBlogs.find(e => e.title === blog.title)
        assert.strictEqual(addedBlog.likes, 0)
    })

    test('add a blog without title or url', async () => {
        let blog = {
            author: 'Anyue Wang',
            url: 'https://anyue.wang/blogs/1',
            likes: 9
        }
        await api
            .post('/api/blogs')
            .send(blog)
            .expect(400)

        const updatedBlogs = await helper.blogsInDb()
        assert.strictEqual(updatedBlogs.length, initialBlogs.length)

        blog = {
            title: 'This is a blog I wrote',
            author: 'Anyue Wang',
            likes: 9
        }
        await api
            .post('/api/blogs')
            .send(blog)
            .expect(400)

        assert.strictEqual(updatedBlogs.length, initialBlogs.length)
    })
})

describe('delete data in MongoDB:', () => {
    test('delete the first blog', async () => {
        const blogs = await helper.blogsInDb()
        const deletedBlog = blogs.at(0)

        await api
            .delete(`/api/blogs/${deletedBlog.id}`)
            .expect(204)

        const updatedBlogs = await helper.blogsInDb()

        assert(!updatedBlogs.find(e => e.id === deletedBlog.id))
        assert.strictEqual(updatedBlogs.length, blogs.length - 1)
    })
})

describe('update data in MongoDB:', () => {
    test('update likes of the first blog', async () => {
        const blogs = await helper.blogsInDb()
        const originBlog = blogs.at(0)
        const updatedLikes = 9999

        await api
            .put(`/api/blogs/${originBlog.id}`)
            .send({ ...originBlog, likes: updatedLikes })
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const updatedBlogs = await helper.blogsInDb()
        const updatedBlog = updatedBlogs.find(e => e.id === originBlog.id)
        assert.strictEqual(updatedBlog.likes, updatedLikes)
    })
})

after(async () => {
    await mongoose.connection.close()
})