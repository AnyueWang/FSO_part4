const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

usersRouter.get('/', async (req, res, next) => {
    try {
        const users = await User
            .find({})
            .populate('blogs', {
                title: 1,
                author: 1,
                url: 1,
                likes: 1,
            })
        res.json(users)
    } catch (exception) {
        next(exception)
    }
})

usersRouter.post('/', async (req, res, next) => {
    const { username, name, password } = req.body
    const pswMinLength = 3

    if (password.length < pswMinLength) {
        res.status(400).send({ error: `password is shorter than the minimum requirement: ${pswMinLength}` })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    try {
        const savedUser = await user.save()
        res.status(201).json(savedUser)
    } catch (exception) {
        next(exception)
    }

})

module.exports = usersRouter