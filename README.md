# Task Manager Web Application

A modern, fully-featured task management application built with semantic HTML, CSS, and vanilla JavaScript.

## Features

✨ **Core Functionality**
- ✅ Add new tasks
- 🗑️ Delete tasks
- ✔️ Mark tasks as completed/uncompleted
- 🔍 Filter tasks (All, Active, Completed)
- 🧹 Clear all completed tasks
- 💾 Persistent storage using localStorage

📱 **User Experience**
- Fully responsive design (desktop, tablet, mobile)
- Modern gradient UI with smooth animations
- Real-time task statistics
- Empty state messaging
- Form validation with error messages

♿ **Accessibility**
- Semantic HTML structure
- ARIA labels and roles
- Screen reader support with live regions
- Keyboard navigation support
- Focus management
- Color contrast compliance
- Reduced motion support

🎨 **Design**
- Modern gradient backgrounds
- Clean, intuitive interface
- Smooth transitions and animations
- Dark mode support
- Print-friendly styles
- Mobile-first responsive approach

## File Structure

```
test-copilot-AI/
├── index.html      # Semantic HTML markup
├── styles.css      # Modern, responsive styling
├── script.js       # Task management functionality
└── README.md       # This file
```

## Getting Started

1. **Open the application**: Simply open `index.html` in any modern web browser
2. **Add a task**: Type a task name in the input field and click "Add Task" or press Enter
3. **Complete a task**: Check the checkbox next to a task to mark it complete
4. **Delete a task**: Click the ✕ button to remove a task
5. **Filter tasks**: Use the filter buttons to view All, Active, or Completed tasks
6. **Clear completed**: Click "Clear Completed" to remove all finished tasks

## Technical Details

### HTML Structure
- Semantic elements: `<header>`, `<main>`, `<section>`, `<article>`, `<footer>`
- Proper form structure with labels and inputs
- ARIA attributes for enhanced accessibility
- Screen reader only content with `.sr-only` class

### CSS Features
- CSS custom properties (variables) for theming
- Flexbox and Grid layouts for responsive design
- Mobile-first approach with media queries
- Dark mode support with `prefers-color-scheme`
- Reduced motion support with `prefers-reduced-motion`
- Print-optimized styles
- Smooth animations and transitions

### JavaScript Functionality
- Object-oriented design with `TaskManager` class
- Event delegation for efficient event handling
- localStorage API for data persistence
- Error handling and validation
- ARIA live regions for screen reader announcements
- Keyboard event handling
- Clean separation of concerns

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Android)

## Accessibility Features

1. **Screen Reader Support**
   - All interactive elements have descriptive labels
   - Live regions announce changes to users
   - Semantic HTML provides document structure

2. **Keyboard Navigation**
   - Tab through all interactive elements
   - Enter/Space to activate buttons
   - Checkbox focus visible

3. **Visual Accessibility**
   - High contrast colors
   - Focus indicators on all interactive elements
   - Reduced motion support for animations
   - Font sizes meet readability standards

4. **Form Validation**
   - Required field validation
   - Error messages with `role="alert"`
   - Clear user feedback

## Data Persistence

Tasks are automatically saved to browser's localStorage. This means:
- Tasks persist across browser sessions
- No server or database required
- Data stored locally on the device
- Approximately 5-10MB storage available

## Responsive Design Breakpoints

- **Desktop**: Full-featured layout
- **Tablet** (640px and below): Adjusted spacing and button layout
- **Mobile** (480px and below): Optimized for small screens, full-width buttons

## Customization

### Colors
Edit the CSS variables in `styles.css`:
```css
:root {
    --primary-color: #6366f1;
    --success-color: #10b981;
    --danger-color: #ef4444;
    /* ... more variables */
}
```

### Typography
Modify the font-family in the `body` rule:
```css
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, /* ... */;
}
```

### Storage Prefix
Update the localStorage key in `script.js`:
```javascript
localStorage.setItem('tasks', JSON.stringify(this.tasks));
```

## Performance Considerations

- Minimal dependencies (vanilla JavaScript)
- Efficient DOM updates
- Optimized CSS with hardware acceleration
- Lazy rendering of only visible tasks
- Debounced storage operations

## Security Notes

- Input text is sanitized through textContent (not innerHTML)
- No external dependencies to keep code clean
- localStorage data is domain-specific
- Suitable for single-user use

## Development

### Adding New Features
1. Create new methods in the `TaskManager` class
2. Add corresponding HTML elements
3. Style with CSS variables
4. Add accessibility attributes (ARIA labels, roles)
5. Test with screen readers and keyboard navigation

### Testing Accessibility
- Use browser DevTools accessibility inspector
- Test with keyboard only (no mouse)
- Test with screen reader (NVDA, JAWS, VoiceOver)
- Test with Windows High Contrast mode
- Verify color contrast with tools like WAVE

## License

Free to use and modify for personal and commercial projects.

## Future Enhancement Ideas

- Task categories/tags
- Priority levels
- Due dates
- Recurring tasks
- Local backup/export
- Import from other apps
- Collaboration features
- Mobile app version
- Cloud sync option

## Troubleshooting

**Tasks not saving?**
- Check if localStorage is enabled in browser
- Verify browser isn't in private/incognito mode
- Check browser's storage limits

**Styling looks broken?**
- Clear browser cache (Ctrl+Shift+Del or Cmd+Shift+Del)
- Ensure styles.css is in same directory as index.html
- Check browser console for errors

**Accessibility issues?**
- Update to latest browser version
- Test with multiple screen readers
- Check ARIA attributes in DevTools

---

Built with ❤️ using semantic HTML, modern CSS, and vanilla JavaScript.
