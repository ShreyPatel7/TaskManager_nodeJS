const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const session = require('express-session');
const bcrypt = require('bcrypt');
const User = require('./models/user');
const Task = require('./models/task');


const app = express();
const PORT = process.env.PORT || 3001;

mongoose.connect('mongodb+srv://Shrey071003:Shrey7103@cluster0.ovjonuo.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch(err => {
  console.error('Error connecting to MongoDB', err);
});

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(session({
  secret: 'ShreyKhushudeepharshKrushilDharm',
  resave: false,
  saveUninitialized: true
}));

app.set('view engine', 'jade');

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
  if (req.session.user) {
    next();
  } else {
    res.redirect('/login');
  }
};

// Route to render the login form
app.get('/login', (req, res) => {
  res.render('login', { title: 'Login' });
});

// Route to handle login form submission
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) {
      res.status(404).send('User not found');
      return;
    }
    if (await bcrypt.compare(password, user.password)) {
      req.session.user = user;
      res.redirect('/');
    } else {
      res.status(401).send('Incorrect password');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Route to render the signup form
app.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up' });
});

// Route to handle signup form submission
app.post('/signup', async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ username, email, password: hashedPassword });
    res.redirect('/login');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// Route to handle logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error(err);
    }
    res.redirect('/login');
  });
});

// Protected route - requires authentication
app.get('/', isAuthenticated, (req, res) => {
  res.render('index', { title: 'Home' });
});

// About page route
app.get('/about', (req, res) => {
  res.render('about', { title: 'About' });
});

app.get('/contact', (req, res) => {
  res.render('contact', { title: 'Contact' });
});

app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.render('tasks', { title: 'Tasks', tasks });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/tasks/new', (req, res) => {
  res.render('add-task', { title: 'Add Task' });
});

app.post('/tasks', async (req, res) => {
  const { title, description, dueDate, dueTime, priority, progress } = req.body;
  try {
    await Task.create({ title, description, dueDate, dueTime, priority, progress });
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.get('/tasks/:id/edit', async (req, res) => {
  const taskId = req.params.id;
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).send('Task not found');
      return;
    }
    res.render('edit-task', { title: 'Edit Task', task });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.put('/tasks/:id', async (req, res) => {
  const taskId = req.params.id;
  const { title, description, dueDate, dueTime, priority, progress, completed } = req.body;
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      res.status(404).send('Task not found');
      return;
    }
    task.title = title;
    task.description = description;
    task.dueDate = dueDate;
    task.dueTime = dueTime;
    task.priority = priority;
    task.progress = progress;
    task.completed = completed === 'on';
    await task.save();
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.delete('/tasks/:id', async (req, res) => {
  const taskId = req.params.id;
  try {
    await Task.findByIdAndDelete(taskId);
    res.redirect('/tasks');
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
