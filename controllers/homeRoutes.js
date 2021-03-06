const router = require('express').Router();
const { Post, User, Comment } = require('../models');

// using redirect to make sure people who arent currently logged in get sent to signup or login pages //
router.get('/login', (req, res) => {
  res.render('login');
});
router.get('/signup', (req, res) => {
  res.render('signup');
});

// getting all posts with comments and user data on who made the post and comment //
router.get('/', async (req, res) => {
  console.log(req.session);
  try {
    const postData = await Post.findAll({
      include: [{
        model: User
      }],
      group: ['id']
    });

    const posts = postData.map(post => post.get({ plain: true }));

    const commentData = await Comment.findAll({
      attributes: ['body']
    });

    const comments = commentData.map(post => post.get({ plain: true }));


    res.render('homepage', {
      posts,
      comments,
      userId: req.session.user_id,
      userName: req.session.name,
      loggedIn: req.session.loggedIn,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
});

// getting one post from post id //
router.get('/post/:id', async (req, res) => {
  try {
    const postData = await Post.findOne({
      where: { id: req.params.id },
      attributes: [
        'id',
        'name',
        'body',
      ],
      order: [['id', 'ASC']],
      include: [{
        model: Comment,
        attributes: ['id', 'body', 'post_id', 'user_id'],
        include: {
          model: User,
          attributes: ['username']
        }
      }, { model: User, attributes: ['username'] }]
    });
    const post = postData.get({ plain: true });
    console.log(post);

    res.render('singlepost', {
      post,
      userId: req.session.user_id,
      userName: req.session.name,
      loggedIn: req.session.loggedIn
    })
  } catch (err) {
    console.log(err);
    res.status(500).json(err);
  }
});

router.get('/create/', (req, res) => {
  Post.findAll({
    where: { userId: req.session.user_id },
    attributes: ['id', 'name', 'body'],
    include: [{
      model: Comment, attributes: ['id', 'body', 'post_id', 'user_id'],
      include: { model: User, attributes: ['username'] }
    },
    { model: User, attributes: ['username'] }]
  }).then(postData => {
    const posts = postData.map(post => post.get({ plain: true }))
    res.render('new', { posts, loggedIn: true });
  }).catch(err => {
    console.log(err);
    res.status(500).json(err);
  });
});

module.exports = router;