const { test, after, beforeEach, describe } = require('node:test')
const assert = require('node:assert')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const bcrypt = require('bcrypt')
const User = require('../models/user')
const { url } = require('node:inspector')

const api = supertest(app)

const rootuser = helper.rootuser

beforeEach(async () => {
    await User.deleteMany({})
    const passwordHash = await bcrypt.hash(rootuser.password, 10)
    const user = new User({ username: rootuser.username, passwordHash })
    await user.save()

    const initialBlogs = await helper.initialBlogs()
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

describe('add a blog to MongoDB:', () => {
    test('add a new blog to DB', async () => {
        const initialBlogs = await helper.initialBlogs()
        const blog = {
            title: 'Steve Jobs Believed This One Thing Separated the Doers From the Dreamers',
            author: 'Nimish Jalan',
            url: 'https://medium.com/@nimishjalan/steve-jobs-believed-this-one-thing-separated-the-doers-from-the-dreamers-083fa0ff947b',
            likes: 1863
        }

        const result = await api
            .post('/api/login')
            .send({ username: rootuser.username, password: rootuser.password })
            .expect(200)
        const token = result.body.token

        await api
            .post('/api/blogs')
            .send(blog)
            .set('Authorization', `Bearer ${token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const updatedBlogs = await helper.blogsInDb()
        assert.strictEqual(updatedBlogs.length, initialBlogs.length + 1)
        assert.strictEqual(updatedBlogs.at(-1).title, blog.title)
    })

    test('default of likes property is set to 0', async () => {
        const initialBlogs = await helper.initialBlogs()
        const blog = {
            title: 'This is a blog I wrote',
            author: 'Anyue Wang',
            url: 'https://anyue.wang/blogs/1',
        }

        const result = await api
            .post('/api/login')
            .send({ username: rootuser.username, password: rootuser.password })
            .expect(200)
        const token = result.body.token

        await api
            .post('/api/blogs')
            .send(blog)
            .set('Authorization', `Bearer ${token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const updatedBlogs = await helper.blogsInDb()
        assert.strictEqual(updatedBlogs.length, initialBlogs.length + 1)

        addedBlog = updatedBlogs.find(e => e.title === blog.title)
        assert.strictEqual(addedBlog.likes, 0)
    })

    test('add a blog without title or url', async () => {
        const initialBlogs = await helper.initialBlogs()
        let blog = {
            author: 'Anyue Wang',
            url: 'https://anyue.wang/blogs/1',
            likes: 9
        }

        const result = await api
            .post('/api/login')
            .send({ username: rootuser.username, password: rootuser.password })
            .expect(200)
        const token = result.body.token

        await api
            .post('/api/blogs')
            .send(blog)
            .set('Authorization', `Bearer ${token}`)
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
            .set('Authorization', `Bearer ${token}`)
            .expect(400)

        assert.strictEqual(updatedBlogs.length, initialBlogs.length)
    })
})

describe('delete a blog in MongoDB:', () => {
    test('delete the first blog', async () => {
        const blogs = await helper.blogsInDb()
        const deletedBlog = blogs.at(0)

        const result = await api
            .post('/api/login')
            .send({ username: rootuser.username, password: rootuser.password })
            .expect(200)
        const token = result.body.token

        await api
            .delete(`/api/blogs/${deletedBlog.id}`)
            .set('Authorization', `Bearer ${token}`)
            .expect(204)

        const updatedBlogs = await helper.blogsInDb()

        assert(!updatedBlogs.find(e => e.id === deletedBlog.id))
        assert.strictEqual(updatedBlogs.length, blogs.length - 1)
    })
})

describe('update a blog in MongoDB:', () => {
    test('update likes of the first blog', async () => {
        const blogs = await helper.blogsInDb()
        const originBlog = blogs.at(0)
        const updatedLikes = 9999

        const result = await api
            .post('/api/login')
            .send({ username: rootuser.username, password: rootuser.password })
            .expect(200)
        const token = result.body.token

        await api
            .put(`/api/blogs/${originBlog.id}`)
            .send({ ...originBlog, likes: updatedLikes })
            .set('Authorization', `Bearer ${token}`)
            .expect(200)
            .expect('Content-Type', /application\/json/)

        const updatedBlogs = await helper.blogsInDb()
        const updatedBlog = updatedBlogs.find(e => e.id === originBlog.id)
        assert.strictEqual(updatedBlog.likes, updatedLikes)
    })
})

describe('add user to MongoDB', () => {
    test('add a user successfully', async () => {
        const originalUsers = await helper.usersInDb()
        const user = {
            username: 'awang',
            name: 'Anyue Wang',
            password: 'tHisIsApaSsWOrD',
        }

        await api
            .post('/api/users')
            .send(user)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const updatedUsers = await helper.usersInDb()
        assert.strictEqual(updatedUsers.length, originalUsers.length + 1)
        const usernames = updatedUsers.map(e => e.username)
        assert(usernames.includes(user.username))
    })

    test('add a user with a name that already exists in DB', async () => {
        const originalUsers = await helper.usersInDb()
        const user = {
            username: rootuser.username,
            name: 'Lunado Wong',
            password: 'asImPLepAsSwOrD'
        }

        const result = await api
            .post('/api/users')
            .send(user)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        assert(result.body.error.includes('expect `username` to be unique'))

        const updatedUsers = await helper.usersInDb()
        assert.strictEqual(updatedUsers.length, originalUsers.length)
    })

    test('add a user with malformatted name', async () => {
        const originalUsers = await helper.usersInDb()
        const user = {
            username: 'lw',
            name: 'Lunado Wong',
            password: 'asImPLepAsSwOrD'
        }

        const result = await api
            .post('/api/users')
            .send(user)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        assert(result.body.error.includes('Path `username` (`lw`) is shorter than the minimum allowed length (3).'))

        const updatedUsers = await helper.usersInDb()
        assert.strictEqual(updatedUsers.length, originalUsers.length)
    })

    test('add a user with malformatted password', async () => {
        const originalUsers = await helper.usersInDb()
        const user = {
            username: 'lwong',
            name: 'Lunado Wong',
            password: 'hi'
        }

        const result = await api
            .post('/api/users')
            .send(user)
            .expect(400)
            .expect('Content-Type', /application\/json/)

        assert(result.body.error.includes('password is shorter than the minimum requirement: 3'))

        const updatedUsers = await helper.usersInDb()
        assert.strictEqual(updatedUsers.length, originalUsers.length)
    })
})

describe('coupling blogs and users', () => {
    test('add blog by user with a token', async () => {
        const originalBlogs = await helper.blogsInDb()
        const originalUsers = await helper.usersInDb()

        const user = originalUsers.find(e => e.username === rootuser.username)
        const blog = {
            title: 'This is a blog I wrote',
            author: 'Anyue Wang',
            url: 'https://anyue.wang/blogs/1'
        }

        const result = await api
            .post('/api/login')
            .send({ username: rootuser.username, password: rootuser.password })
            .expect(200)
            .expect('Content-Type', /application\/json/)
        const token = result.body.token

        await api
            .post('/api/blogs')
            .send(blog)
            .set('Authorization', `Bearer ${token}`)
            .expect(201)
            .expect('Content-Type', /application\/json/)

        const updatedBlogs = await helper.blogsInDb()
        const updatedUsers = await helper.usersInDb()
        const updatedBlog = updatedBlogs.find(e => e.title === blog.title)
        const updatedUser = updatedUsers.find(e => e.id === user.id)

        assert.strictEqual(updatedBlogs.length, originalBlogs.length + 1)
        assert.strictEqual(updatedBlog.user.id, updatedUser.id)
        assert.strictEqual(updatedUser.blogs[0].id, updatedBlog.id)

    })

    test('add blog by user without a token', async () => {
        const originalBlogs = await helper.blogsInDb()
        const blog = {
            title: 'This is a blog I wrote',
            author: 'Anyue Wang',
            url: 'https://anyue.wang/blogs/1'
        }

        const result = await api
            .post('/api/blogs')
            .send(blog)
            .expect(401)
            .expect('Content-Type', /application\/json/)
        assert(result.body.error.includes('token invalid'))

        const updatedBlogs = await helper.blogsInDb()
        assert.strictEqual(originalBlogs.length, updatedBlogs.length)
    })
})

after(async () => {
    await mongoose.connection.close()
})