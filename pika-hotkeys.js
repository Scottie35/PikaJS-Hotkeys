/** 
 *	@license PikaJS Hotkeys plugin 1.3.0
 * 	Based on jQuery hotkeys by John Resig: https://github.com/jeresig/jquery.hotkeys
 *	© 2022-2023 Scott Ogrin & Quantum Future Group, Inc.
 * 	MIT License
 */

(function($) {

  $.hotkeys = {
    Version: "1.3.0",
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
  function keyHandler(event, key) {
  	// key = i.e. "ctrl+b" OR it can be "space, ctrl+b, w" (comma + space between multiple keys REQUIRED)
    var special = event.type !== "keypress" && $.hotkeys.specialKeys[event.which],
      character = String.fromCharCode(event.which).toLowerCase(),
      modif = "",
      keys = key.split(', '),
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
		for (var j=0, m=keys.length; j<m; j++) {
			if (!$.t(possible[keys[j]])) {
				return [true, keys[j]];
			}
		}
		return [false, null];
  }

	$.extend($.fn, {
		// jQuery-like delegated event handler (this = parent where listener is attached)
		// We override this PikaJS function here so that _on will properly handle keydown, keyup, and keypress events!!
		// For intercepting key events, there is an extra param
		// fnkey = f() OR key; If 5 params given, fnkey = key AND stopbublfn = f()
		// Ex:
		//		$('#mydiv')._on('mousedown', '#myspan', function(evt) {Blah...});
		//		$('#mydiv')._on('mousedown', '#myspan', function(evt) {Blah...}, false);								// Allow bubble!
		//		$('#mydiv')._on('keydown', '#myspan', 'ctrl+z', function(evt, key) {Blah...});					// Ctrl-Z keydown, bubble based on return value
		//		$('#mydiv')._on('keydown', '#myspan', 'ctrl+z, space', function(evt, key) {Blah...});		// Ctrl-Z AND space keydown, bubble based on return value
		//		$('#mydiv')._on('keydown', '#myspan', 'ctrl+z', function(evt, key) {Blah...}, false); 	// Ctrl-Z keydown, bubbles!
		//		$('#mydiv')._on('keydown', '#myspan', 'ctrl+z', function(evt, key) {Blah...}, true); 		// Ctrl-Z keydown, never bubbles!
		_on: function(event, expr, fnkey, stopbublfn, stopbubl) {
			// Prevent attaching if parent doesn't exist (so we can load all handlers on all pages if we want)
			if ($.t(this[0])) { return; }
			var special = false, evtarr = event.split(/\.(.+)/), Me = 'mouseenter', Kd = 'keydown', Kp = 'keypress', Ku = 'keyup', RelT = 'relatedTarget';
			// Are we doing event keydown, keyup, or keypress?
			if (evtarr[0] == Kd || evtarr[0] == Kp || evtarr[0] == Ku) {
				// Yes: Do keyboard event  (4 or 5 params) - By default we do keystroke callback return value = !stopbubl
				stopbubl = ($.t(stopbubl) ? null : stopbubl);
			} else {
				// No: regular _on  (3 or 4 params) - By default we PREVENT bubble if $.Bubble == false
				stopbubl = ($.t(stopbublfn) ? (!$.Bubble) : stopbublfn);
			}
			// Change mouseenter->mousover, mouseleave->mouseout (with special checks below)
			if (evtarr[0] == Me || evtarr[0] == 'mouseleave') {
				special = true;
				event = ((evtarr[0] == Me) ? 'mouseover' : 'mouseout') + ($.t(evtarr[1]) ? '' : '.' + evtarr[1]);
			}
			// Attach to PARENT, filter for child
			this.on(event, function(evt) {
				// Either we have normal event, or we need to override mouseenter/leave to make them more useful:
				// We make mouseenter/leave into over/out AND and do some special checking
				// This allows delegated mouseenter/leave listeners since normally, they don't bubble
				// In short, we do NOT fire the event if we're dealing with entering or leaving a child element in some cases
				var et = evt.target, res;
				if (et && ($(et).is(expr) || $(expr).contains(et)) && (!special || (special && (!evt[RelT] || (evt[RelT] !== et && !$(et).contains(evt[RelT])))))) {
					// Are we doing keypress?
					if (evtarr[0] == Kd || evtarr[0] == Kp || evtarr[0] == Ku) {
						// Include hotkeys logic
						res = keyHandler(evt, fnkey);
						if (res[0]) {
							// We're calling our handler... For bubble, we have 3 cases (see above).
							// This is needed so that on keystroke, we can do just our handler, just browser-based keystroke, or both
							// Sometimes, we want our callback to happen BEFORE browser-based keystroke action, like for a WYSIWYG
							// editor. This allows that!
							// 4th param is f(), 5th is optional stopbubl:
							if (stopbubl == null) {
								// Default is we use the return value of the callback for bubble cancel
								// return true = ALLOW bubble
								// return false = STOP bubble
								if (stopbublfn.call($(evt.target), evt, res[1]) === false) { // func will have this = $() & f(evt, keystroke)
									$.S(evt);
								}
							} else {
								// stopbubl was passed in, so use it instead
								if (stopbubl) { $.S(evt); }
								stopbublfn.call($(evt.target), evt, res[1]);
							}
						}
					} else {
						// NOT keypress, so 3-4 params total for _on
						// 4th param is stopbublfn, which we set to stopbubl above
						if (stopbubl) { $.S(evt); }
						// 3rd param is f():
						fnkey.call((special || $(et).is(expr)) ? $(et) : $(et).up(expr), evt); // func will have this = $() & f(evt) 
					}
				}
			});
			return this;
		}
	});

})(Pika);
