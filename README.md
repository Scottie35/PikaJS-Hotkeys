# PikaJS-Hotkeys

Hotkeys plugin for PikaJS that is only **1.99KB** minified!!

## What is PikaJS?

[PikaJS](https://github.com/Scottie35/PikaJS) is a client-side scripting library like jQuery, but 7 times smaller, faster, and more efficient.

**You must include PikaJS before adding PikaJS Hotkeys to your page!**

## What does it do?

Pika's Hotkeys plugin provides the ability to use delegated event listeners for keystrokes.

Key combos are also supported. So, you can run any function you want on Spacebar, Backspace, Ctrl-S, Ctrl-Shift-T, or whatever else you need.

Hotkeys is very small and very easy to use:

### ._on

Hotkeys overrides the default `._on` method in PikaJS. You simply use it like this:

    $('#mydiv')._on('mousedown', '#myspan', function() {...});
    $('#mydiv')._on('mousedown', '#myspan', function() {...}, false);   // Allow bubble!
    $('#mydiv')._on('keydown', '#myspan', 'ctrl+z', function() {...});  // Ctrl-Z keydown, bubble based on return value
    $('#mydiv')._on('keydown', '#myspan', 'backspace', function() {...}, false);  // Backspace keydown, bubbles!
    $('#mydiv')._on('keydown', '#myspan', 'space', function() {...}, true);   // Space keydown, never bubbles!
		
This is the one you'll use most often:
		
    $('#mydiv')._on('keydown', '#myspan', 'ctrl+z', function() {...});    // Bubble based on function() return value
		
In PikaJS Hotkeys, the modified `._on` takes either 4 or 5 params:

    $('#mydiv')._on(event, expr, fnkey, stopbublfn, stopbubl) {...}

For **non-keystroke** event listeners, you pass maximum 4 params:

- event - event name
- expr - secondary selector for delegated event listener
- **fn**key - callback function when the event is triggered
- **stopbubl**fn - *optional* boolean value to stop or permit event bubbling

For **keystroke** event listeners, you can pass 5 params:

- event - event name
- expr - secondary selector for delegated event listener
- fn**key** - string representing the keystroke to watch (can include F keys, ctrl, shift, pageup, etc.)
- stopbubl**fn** - callback function when the event is triggered
- stopbubl - *optional* boolean value to stop or permit event bubbling. If omitted, this defaults to the return value of the callback

As noted, most often you'll use `._on` with only 4 params and just include a boolean return value in your callback function to allow/prevent event bubble.

Simple example:

    $('div#container)._on("keydown", 'span#toggle', "ctrl+\\", function() {
      \\ Do some magic here on Ctrl+\ (backslash must be escaped as a parameter)
      \\ ...
      \\ return false to PREVENT browser from doing the keystroke itself:
      return false;
      \\ Or return true to ALLOW the browser to also do its thing AFTER you've done your magic!
    });

If you prevent keystroke event bubbling, the key event will not be triggered by the browser. Practically, this means you probably want to do something like this if you're building, say, a WYSIWYG editor:

1. User presses Spacebar in content-editable DIV
2. *keydown* handler sees Spacebar, and runs your passed-in callback function
3. Your callback gets the position of the caret, and checks the surrounding text to see if it needs to do anything special
	1. If it does, your callback inserts its own space in the content, then cleans things up (for example). Callback returns *false* to prevent the browser from entering its own space character.
	2. If it does NOT, your callback simply returns *true*, and the browser handles insertion of the space character.

All other non-keystroke events are handled as usual by `._on`.

Recall that in PikaJS, `$.Bubble` = *false* by default. In your code, you can change this to *true* if you want PikaJS to work more like jQuery and allow event bubbling by default.

**That's all, folks!**
