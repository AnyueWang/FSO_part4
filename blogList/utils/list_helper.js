const _ = require('lodash')

const dummy = blogs => {
    return 1
}

const totalLikes = blogs => {
    return blogs.reduce((sum, e) => {
        return sum + e.likes
    }, 0)
}

const favoriteBlog = blogs => {
    if (blogs.length === 0) {
        return {}
    }
    const sortedList = blogs.sort((a, b) => {
        return b.likes - a.likes
    })
    return sortedList[0]
}

const mostBlogs = blogs => {
    return mostCalculator(blogs, 'blogs')
}

const mostLikes = blogs => {
    return mostCalculator(blogs, 'likes')
}

const mostCalculator = (blogs, property) => {
    if (_.isEmpty(blogs)) {
        return {}
    }
    const authors = _.reduce(blogs, (acc, blog) => {
        const author = blog.author
        if (!!_.find(acc, { author })) {
            const idx = _.findIndex(acc, e => e.author === author)
            acc[idx][property] += addedNumber(blog, property)
        } else {
            const newAuthor = { author }
            newAuthor[property] = addedNumber(blog, property)
            acc = _.concat(acc, newAuthor)
        }
        return acc
    }, [])
    return authors.sort((a, b) => b[property] - a[property])[0]
}

const addedNumber = (blog, property) => {
    if (property === 'blogs') {
        return 1
    } else if (property === 'likes') {
        return blog.likes
    }
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes,
}