/********************************************************************************
 * Copyright (C) 2020 CoCreate LLC and others.
 *
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import "./index.css";
import observer from "@cocreate/observer";
import prism from "@cocreate/prism";

function init() {
	let elements = document.querySelectorAll('[type="code"]');
	initElements(elements);
}

function initElements(elements) {
	for (let element of elements) initElement(element);
}

function initElement(element) {
	// element.evt("beforeElementsAdded");

	// Disable spellcheck and other interfering features
	const desiredAttributes = {
		spellcheck: "false",
		autocomplete: "off",
		autocorrect: "off",
		autocapitalize: "none"
	};

	/**
	 * Sets specific attributes on an element if they are not already defined.
	 *
	 * @param {HTMLElement} element - The element to set attributes on.
	 * @param {Object} attributes - An object containing attribute key-value pairs.
	 */
	for (const [attr, value] of Object.entries(desiredAttributes)) {
		if (!element.hasAttribute(attr)) {
			element.setAttribute(attr, value);
		}
	}

	// element.setAttribute('spellcheck', 'false');
	// element.setAttribute('autocomplete', 'off');
	// element.setAttribute('autocorrect', 'off');
	// element.setAttribute('autocapitalize', 'none');

	let pre, code;
	if (element.codeElement) {
		code = element.codeElement;
		pre = element.codeElement.parentElement;
	} else {
		let codearea = element.closest("codearea");
		if (codearea) {
			code = codearea.querySelector("code");
			if (code) {
				pre = code.parentElement;
				element.codeElement = code;
			}
		}

		if (!code) {
			code = document.createElement("code");
		}

		if (!pre) {
			pre = document.createElement("pre");
			pre.setAttribute("aria-hidden", "true"); // Hide for screen readers
			pre.append(code);
		}
		_initEvents(element);
	}

	let theme = element.getAttribute("theme");
	if (theme) {
		pre.setAttribute("theme", theme);
	}

	let lineNumbers = element.getAttribute("line-numbers");
	if ((lineNumbers && lineNumbers !== "false") || lineNumbers === "") {
		pre.classList.add("line-numbers");
	}

	let computed = getComputedStyle(element);
	let rect = element.getBoundingClientRect();

	let style = pre.style;

	style.position = "absolute";
	style.width = rect.width + "px";
	style.height = rect.height + "px";
	style.overflowX = computed["overflowX"];
	style.overflowY = computed["overflowY"];
	style.margin = "0px";
	style.padding = computed["padding"];
	style.border = computed["border"];
	style.borderColor = "transparent";
	style.outline = computed["outline"];
	style.outlineColor = "transparent";
	style.boxSizing = computed["boxSizing"];
	style.lineHeight = computed["lineHeight"];

	if (element.parentElement && !element.parentElement.style["position"]) {
		element.parentElement.style["position"] = "relative";
	}

	if (
		element.parentElement &&
		element.parentElement.style["display"] == "inline"
	) {
		style.top = element.clientTop + "px";
		style.left = element.clientLeft + "px";
	} else {
		style.top = element.offsetTop + "px";
		style.left = element.offsetLeft + "px";
	}

	if (element.nodeName !== "INPUT") {
		code.style.wordWrap = "break-word";
		code.style.whiteSpace = "pre-wrap";
	} else {
		code.style.whiteSpace = "pre";
	}

	let properties = [
		"fontStyle",
		"fontVariant",
		"fontWeight",
		"fontStretch",
		"fontSize",
		"fontFamily",
		"letterSpacing",
		"lineHeight",
		"textAlign",
		"textTransform",
		"textIndent",
		"textDecoration",
		"textRendering",
		"textTransform",
		"textIndent",
		"overflowWrap",
		"tabSize",
		"webkitWritingMode",
		"wordSpacing"
	];

	properties.forEach(function (prop) {
		if (["left", "top"].indexOf(prop.toLowerCase()) === -1) {
			code.style[prop] = computed[prop];
		}
	});

	let lang = element.getAttribute("lang");
	if (!lang) {
		lang = "html";
		element.setAttribute("lang", lang);
	}
	code.classList.add("language-" + lang);

	if (!element.codeElement) {
		element.insertAdjacentElement("beforebegin", pre);
		element.codeElement = code;
	}
	// element.evt("afterElementsAdded");

	update({ target: element });
}

async function update(event) {
	let codeElement = event.target.codeElement;

	// TODO: Use getValue(), beaware of edgecase were attribute value will take priority over innerHTML
	// let text = event.target.getValue();
	let text = event.target.value;
	if (!text && (text = event.target.getAttribute("value") || "")) {
		event.target.setValue(text, false);
	}

	if (text[text.length - 1] == "\n") {
		text += " ";
	}

	if (event.target.hasAttribute("value"))
		event.target.setAttribute("value", text);

	// TODO: Prism could observe code element for changes and initialize
	let lang = event.target.getAttribute("lang");
	if (text && lang) {
		text = await prism.highlightText(text, lang);
		codeElement.innerHTML = text;
	}
}

function _initEvents(element) {
	element.addEventListener("input", update);

	element.addEventListener("keydown", function () {
		scrollSync(element);
	});

	element.addEventListener("scroll", function () {
		scrollSync(element);
	});

	initResizeObserver(element);
}

function scrollSync(element) {
	let preElement = element.codeElement.parentElement;
	preElement.scrollTop = element.scrollTop;
	preElement.scrollLeft = element.scrollLeft;
}

function initResizeObserver(element) {
	const watch = new ResizeObserver(() => initElement(element));
	watch.observe(element);
}

init();

observer.init({
	name: "CoCreateCodeareaAddedNodes",
	observe: ["addedNodes"],
	selector: '[type="code"]',
	callback(mutation) {
		initElement(mutation.target);
	}
});

observer.init({
	name: "CoCreateFilterObserver",
	observe: ["attributes"],
	attributeName: ["type"],
	selector: '[type="code"]',
	callback: function (mutation) {
		initElement(mutation.target);
	}
});

export default { initElement };
