# TinyPine.js Testing Guide

## 🚀 Quick Start

### Start the Development Server

```bash
npm run dev
# or
npx serve -p 8000
```

### Open the Demo

Navigate to: `http://localhost:8000/demo/index.html`

## ✅ Test Cases

### 1. Counter Functionality

**Test**: Click the increment (+) button

- **Expected**: Counter value increases by 1
- **Verify**: `t-text="count"` updates correctly

**Test**: Click the decrement (-) button

- **Expected**: Counter value decreases by 1

**Test**: Click the reset button

- **Expected**: Counter resets to 0

### 2. Two-Way Data Binding (t-model)

**Test**: Type in the input field

- **Expected**: Name property updates in state
- **Verify**: Message "Hello, [name]!" appears below
- **Check**: Message updates as you type

### 3. Conditional Display (t-show)

**Test**: Enter a name in the input

- **Expected**: Welcome message container becomes visible
- **Verify**: `t-show="name"` works correctly

**Test**: Leave input empty

- **Expected**: Welcome message container is hidden

### 4. Class Toggle (t-class)

**Test**: Click increment to make count > 0

- **Expected**: Counter badge gets green background (positive class)

**Test**: Click decrement to make count < 0

- **Expected**: Counter badge gets red background (negative class)

**Test**: Click reset to make count = 0

- **Expected**: Counter badge gets gray background (zero class)

### 5. Expression Evaluation

**Test**: Check the welcome message

- **Expected**: `'Hello, ' + name + '! 👋'` concatenates correctly
- **Verify**: Complex expressions work

### 6. Multiple Scopes (Future)

**Test**: Check for scope isolation

- **Expected**: Each `t-data` creates its own scope
- **Verify**: State doesn't leak between scopes

## 🐛 Debugging

### Console Checks

Open browser DevTools Console and check for:

1. **Initialization**: No errors on page load
2. **Warnings**: Check for `[TinyPine] Unknown directive` warnings
3. **Expression Errors**: Look for `[TinyPine] Expression evaluation failed`

### Common Issues

#### Issue: Buttons don't work

- Check: Is `t-click` attribute present?
- Check: Is `t-data` parent scope defined?
- Verify: State variable exists in scope

#### Issue: t-model doesn't update

- Check: Property exists in `t-data` object
- Verify: No syntax errors in expression
- Check: Browser console for errors

#### Issue: t-class not applying

- Check: CSS classes are defined
- Verify: Expression evaluates to boolean
- Check: Class name syntax (t-class:className)

## 📊 Browser Compatibility

### Test on:

- ✅ Chrome 49+
- ✅ Firefox 18+
- ✅ Safari 10+
- ✅ Edge 79+

### Known Limitations:

- IE 11: Proxy support limited
- Requires ES6 modules (use http server, not file://)

## 🧪 Manual Testing Checklist

- [ ] Counter increments correctly
- [ ] Counter decrements correctly
- [ ] Reset button works
- [ ] Input two-way binding works
- [ ] Welcome message appears/disappears
- [ ] Class toggles apply correctly
- [ ] No console errors
- [ ] No console warnings (or only expected warnings)
- [ ] Responsive layout works
- [ ] Events fire only once per click
- [ ] State changes update DOM immediately

## 🎯 Performance Test

### Memory Leak Check

1. Open DevTools → Memory tab
2. Take heap snapshot
3. Click buttons 100 times
4. Take another heap snapshot
5. **Expected**: Minimal memory increase
6. **Verify**: No event listeners accumulating

### Performance Metrics

- Initial load: < 4KB (minified target)
- Runtime overhead: Minimal (Proxy is native)
- DOM updates: Instant

## 📝 Notes

- All directives are reactive
- State changes trigger automatic DOM updates
- Event listeners are properly cleaned up
- No memory leaks in normal usage
- Zero external dependencies
