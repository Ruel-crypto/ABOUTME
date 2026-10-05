# 🎉 About Me Quiz

A fun, interactive quiz webpage to let people learn interesting facts about you!

## Features

✨ **Interactive Quiz Interface** - Beautiful, modern design with smooth animations
📊 **Progress Tracking** - Visual progress bar shows how far through the quiz you are
🎯 **Instant Feedback** - See if your answer is correct with animations and fun facts
🏆 **Score Display** - Get a personalized message based on your performance
📱 **Responsive Design** - Looks great on desktop, tablet, and mobile devices

## How to Customize

### Edit the Questions
Open `script.js` and find the `quizQuestions` array. Each question object has:

```javascript
{
    question: "Your question here?",
    answers: ["Option 1", "Option 2", "Option 3", "Option 4"],
    correct: 0, // Index of correct answer (0-3)
    fun_fact: "Interesting fact about you!"
}
```

**Example:**
```javascript
{
    question: "What's my favorite programming language?",
    answers: ["Python", "JavaScript", "Go", "Rust"],
    correct: 1, // JavaScript is the correct answer
    fun_fact: "I love JavaScript for its flexibility and the amazing web ecosystem!"
}
```

### Customize Colors & Style
Edit `style.css` to change:
- Color scheme (currently purple gradient)
- Fonts and sizes
- Button styles
- Animations

### Customize Header Text
Edit `index.html` to change:
- Title
- Subtitle
- Page title

## File Structure

```
├── index.html    - HTML template
├── style.css     - Styling and animations
├── script.js     - Quiz logic (edit questions here!)
└── README.md     - This file
```

## How to Use

1. **Deploy** the files to your hosting (GitHub Pages, Netlify, Vercel, etc.)
2. **Share** the link with friends
3. **Watch** them learn fun facts about you!

## Tips for Great Questions

- Mix different topics about yourself (hobbies, favorite things, fun facts)
- Make the wrong answers plausible but clearly wrong
- Add fun facts that reveal more about your personality
- Keep the quiz short (5-10 questions is ideal)
- Make it entertaining and let your personality shine!

---

Made with ❤️ - Happy sharing!
