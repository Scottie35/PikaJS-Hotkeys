/** 
 *	@license PikaJS Hotkeys plugin 1.0
 * 	Based on jQuery hotkeys by John Resig: https://github.com/jeresig/jquery.hotkeys
 *	© 2022 Scott Ogrin & Quantum Future Group, Inc.
 * 	MIT License
 */

(function($) {

  $.hotkeys = {
    Version: "1.0",
    specialKeys: {
      8: "backspace",
      9: "tab",
      10: "return",
      13: "return",
      16: "shift",
      17: "ctrl",
      18: "alt",
      19: "pause",
      20: "capslock",
      27: "esc",
      32: "space",
      33: "pageup",
      34: "pagedown",
      35: "end",
      36: "home",
      37: "left",
      38: "up",
      39: "right",
      40: "down",
      45: "insert",
      46: "del",
      59: ";",
      61: "=",
      96: "0",
      97: "1",
      98: "2",
      99: "3",
      100: "4",
      101: "5",
      102: "6",
      103: "7",
      104: "8",
      105: "9",
      106: "*",
      107: "+",
      109: "-",
      110: ".",
      111: "/",
      112: "f1",
      113: "f2",
      114: "f3",
      115: "f4",
      116: "f5",
      117: "f6",
      118: "f7",
      119: "f8",
      120: "f9",
      121: "f10",
      122: "f11",
      123: "f12",
      144: "numlock",
      145: "scroll",
      173: "-",
      186: ";",
      187: "=",
      188: ",",
      189: "-",
      190: ".",
      191: "/",
      192: "`",
      219: "[",
      220: "\\",
      221: "]",
      222: "'"
    },
    shiftNums: {
      "`": "~",
      "1": "!",
      "2": "@",
      "3": "#",
      "4": "$",
      "5": "%",
      "6": "^",
      "7": "&",
      "8": "*",
      "9": "(",
      "0": ")",
      "-": "_",
      "=": "+",
      ";": ": ",
      "'": "\"",
      ",": "<",
      ".": ">",
      "/": "?",
      "\\": "|"
    },
  }

  // Due to self-executing function, this is 'private':
  function keyHandler(event, key, cthis) {
    var special = event.type !== "keypress" && $.hotkeys.specialKeys[event.which],
      character = String.fromCharCode(event.which).toLowerCase(),
      modif = "",
      possible = {};

    var speshulKeys = ["alt", "ctrl", "shift"];
    for (var i=0, l=speshulKeys.length; i<l; i++) {
      if (event[speshulKeys[i] + 'Key'] && special !== speshulKeys[i]) {
        modif += speshulKeys[i] + '+';
      }
    }

    // metaKey is triggered off ctrlKey erronously
    if (event.metaKey && !event.ctrlKey && special !== "meta") {
      modif += "meta+";
    }

    if (event.metaKey && special !== "meta" && modif.indexOf("alt+ctrl+shift+") > -1) {
      modif = modif.replace("alt+ctrl+shift+", "hyper+");
    }

    if (special) {
      possible[modif + special] = true;
    } else {
      possible[modif + character] = true;
      // Avoid entries like "ctrl+undefined" in possible[]:
      if (!$.t($.hotkeys.shiftNums[character])) {
      	possible[modif + $.hotkeys.shiftNums[character]] = true;      	
	      // "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
	      if (modif === "shift+") {
	        possible[$.hotkeys.shiftNums[character]] = true;
	      }
      }
    }
		return !$.t(possible[key]) ? true : false;
  }

	$.extend($.fn, {
		// jQuery-like delegated event handler (this = parent where listener is attached)
		// We override this PikaJS function here so that _on will properly handle keydown, keyup, and keypress events!!
		// For intercepting key events, there is an extra param
		// fnkey = f() OR key; If 5 params given, fnkey = key AND stopbublfn = f()
		// Ex:
		//		$('#mydiv')._on('mousedown', '#myspan', function() {Blah...});
		//		$('#mydiv')._on('mousedown', '#myspan', function() {Blah...}, false);						// Allow bubble!
		//		$('#mydiv')._on('keydown', '#myspan', 'ctrl+z', function() {Blah...});					// Ctrl-Z keydown, bubble based on return value
		//		$('#mydiv')._on('keydown', '#myspan', 'ctrl+z', function() {Blah...}, false); 	// Ctrl-Z keydown, bubbles!
		//		$('#mydiv')._on('keydown', '#myspan', 'ctrl+z', function() {Blah...}, true); 		// Ctrl-Z keydown, never bubbles!
		_on: function(event, expr, fnkey, stopbublfn, stopbubl) {
			// Prevent attaching if parent doesn't exist (so we can load all handlers on all pages if we want)
			if ($.t(this[0])) { return; }
			var special = false;
			// Are we doing event keydown, keyup, or keypress?
			if (event == 'keydown' || event == 'keypress' || event == 'keyup') {
				// Yes: Do keyboard event  (4 or 5 params) - By default we do keystroke callback return value = !stopbubl
				stopbubl = ($.t(stopbubl) ? null : stopbubl);
			} else {
				// No: regular _on  (3 or 4 params) - By default we PREVENT bubble if $.Bubble == false
				stopbubl = ($.t(stopbublfn) ? (!$.Bubble) : stopbublfn);
			}
			// Change mouseenter->mousover, mouseleave->mouseout (with special checks below)
			if (event == 'mouseenter') {
				special = true;
				event = 'mouseover';
			} else if (event == 'mouseleave') {
				special = true;
				event = 'mouseout';
			}
			// Attach to PARENT, filter for child
			this.on(event, function(evt) {
				var cthis = this;
				if (evt.target && $(evt.target).is(expr)) {
					// Are we doing keypress?
					if (event == 'keydown' || event == 'keypress' || event == 'keyup') {
						// Include hotkeys logic
						if (keyHandler(evt, fnkey, cthis)) {
							// We're calling our handler... For bubble, we have 3 cases (see above).
							// This is needed so that on keystroke, we can do just our handler, just browser-based keystroke, or both
							// Sometimes, we want our callback to happen BEFORE browser-based keystroke action, like for a WYSIWYG
							// editor. This allows that!
							// 4th param is f():
							if (stopbubl == null) {
								// Default is we use the return value of the callback for bubble cancel
								// return true = ALLOW bubble
								// return false = STOP bubble
								if (stopbublfn.call($(evt.target), evt) === false) { // func will have evt, this = $()
									$.S(evt);
								}
							} else {
								// stopbubl was passed in, so use it instead
								if (stopbubl) { $.S(evt); }
								stopbublfn.call($(evt.target), evt);
							}
						}
					} else if (!special || (special && !evt.relatedTarget || (evt.relatedTarget !== evt.target && !evt.target.contains(evt.relatedTarget)))) {
						// Either have normal event, or we need to override mouse enter/leave to make them more useful:
						// We make mouseenter/leave into over/out AND and do some special checking
						// This allows delegated mouseenter/leave listeners since normally, they don't bubble
						// In short, we do NOT fire the event if we're dealing with entering or leaving a child element in some cases
						if (stopbubl) { $.S(evt); }
						// 3rd param is f():
						fnkey.call($(evt.target), evt); // func will have evt, this = $()	
					}
				}
			});
		}
	});

})(Pika);
