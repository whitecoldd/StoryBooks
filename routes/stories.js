const express = require('express')
const router = express.Router()
const { ensureAuth } = require('../middleware/auth')
const Story = require('../models/Story')
//Show/Add Page

router.get('/add', ensureAuth, (req, res) => {
    res.render('stories/add')
})

//Post Story
router.post('/', ensureAuth, async (req, res) => {
    try {
        req.body.user = req.user.id
        await Story.create(req.body)
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        res.render('errors/500')
    }
})

//Get Stories
router.get('/', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({
            status: 'public'
        })
            .populate('user')
            .sort({ createdAt: 'desc' })
            .lean()
        res.render('stories/index', {
            stories
        })
    } catch (error) {
        console.error(error)
        res.render('errors/500')

    }
})
//Get A Story

router.get('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).populate('user').lean()
        if(!story){
            return res.render('errors/404')
        } else {

        }
        res.render('stories/show', {story})
    } catch (error) {
        console.error(error)
        return res.render('error/404')
    }
})

//Get User Stories
router.get('/user/:id', ensureAuth, async (req, res) => {
    try {
        const stories = await Story.find({
            user: req.params.id,
            status: 'public'
        }).populate('user').lean()
        res.render('stories/index', {
            stories
        })
    } catch (error) {
        console.error(error)
        res.render('errors/500')
    }
})

//Get Edit Story
router.get('/edit/:id', ensureAuth, async (req, res) => {
    try {
        const story = await Story.findOne({
            _id: req.params.id
        }).lean()
        if (!story) {
            return res.render('errors/404')
        }
        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            res.render('stories/edit', {
                story,
            })
        }
    } catch (error) {
        console.error(error)
        return res.render('error/500')
    }
})

//Update Story
router.put('/:id', ensureAuth, async (req, res) => {
    try {
        let story = await Story.findById(req.params.id).lean()

        if (!story) {
            res.render('error/404')
        }
        if (story.user != req.user.id) {
            res.redirect('/stories')
        } else {
            story = await Story.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true })
            res.redirect('/dashboard')
        }
    } catch (error) {
        console.error(error)
        return res.render('error/500')
    }
})
//Delete Story
router.delete('/:id', ensureAuth, async (req, res) => {
    try {
        await Story.remove({ _id: req.params.id })
        res.redirect('/dashboard')
    } catch (error) {
        console.error(error)
        return res.render('error/500')
    }
})

module.exports = router