/********************************************************************************
 * Copyright (C) 2020 CoCreate LLC and others.
 *
 *
 * SPDX-License-Identifier: MIT
 ********************************************************************************/

import "./index.css"
import observer from "@cocreate/observer"
import prism from "@cocreate/prism"

function init() {
    let elements = document.querySelectorAll('textarea[type="code"]');
    initElements(elements);
}

function initElements(elements) {
    for(let element of elements)
        initElement(element);
}

function initElement(element) {
    // element.evt("beforeElementsAdded");
    let pre, code;
    if (element.codeElement) {
        code = element.codeElement
        pre = element.codeElement.parentElement
    } else {
        code = document.createElement("code");
        pre = document.createElement("pre");
        pre.setAttribute("aria-hidden", "true"); // Hide for screen readers
        pre.append(code);
        _initEvents(element)
    }

    let theme = element.getAttribute("theme");
    if(theme) {
        pre.setAttribute("theme", theme)
    }

    let lineNumbers = element.getAttribute("line-numbers");
    if (lineNumbers && lineNumbers !== 'false' || lineNumbers === '') {
        pre.classList.add("line-numbers");
    }

    let computed = getComputedStyle(element);
    let rect = element.getBoundingClientRect();

    let style = pre.style;
    
    style.position = 'absolute';
    style.width = rect.width + 'px';
    style.height = rect.height + 'px';
    style.overflowX = computed['overflowX'];
    style.overflowY = computed['overflowY'];
    style.margin = '0px';
    style.padding = computed['padding'];
    style.border = computed['border'];
    style.borderColor = 'transparent';
    style.outline = computed['outline'];
    style.outlineColor = 'transparent';
    style.boxSizing = computed['boxSizing'];
    style.lineHeight = computed['lineHeight'];
    
    if (element.parentElement.style['display'] == 'inline') {
        style.top = element.clientTop + 'px';
        style.left = element.clientLeft + 'px';
    } else {
        style.top = element.offsetTop + 'px';
        style.left = element.offsetLeft + 'px';
    }
    
    if (element.nodeName !== 'INPUT') {
        code.style.wordWrap = 'break-word';
        code.style.whiteSpace = 'pre-wrap';
    } else {
        code.style.whiteSpace = 'pre';
    }

    let properties = ['fontStyle', 'fontVariant', 'fontWeight', 'fontStretch', 'fontSize', 'fontFamily', 'letterSpacing', 'lineHeight', 'textAlign', 'textTransform', 'textIndent', 'textDecoration', 'textRendering', 'textTransform', 'textIndent', 'overflowWrap', 'tabSize', 'webkitWritingMode', 'wordSpacing'];

    properties.forEach(function(prop) {
        if (['left', 'top'].indexOf(prop.toLowerCase()) === -1) {
            code.style[prop] = computed[prop];
        }
    });

    let lang = element.getAttribute("lang");
    if(!lang) {
        lang = 'html'
        element.setAttribute("lang", lang)
    }
    code.classList.add("language-" + lang);
    
    if (!element.codeElement) {
        element.insertAdjacentElement('beforebegin', pre);
        element.codeElement = code
    }
    // element.evt("afterElementsAdded");

    update({target: element})
}

function update(event) {
    let codeElement = event.target.codeElement;

    let text = event.target.value
    if (text[text.length - 1] == "\n") {
        text += " ";
    }

    let lang = event.target.getAttribute("lang");
    if (text && lang) {
        text = prism.highlightText(text, lang);
        codeElement.innerHTML = text
    }
}

function _initEvents(element) {
    element.addEventListener('input', update);

    element.addEventListener('keydown', function() {
        scrollSync(element);
    });

    element.addEventListener('scroll', function() {
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
    name: 'CoCreateCodeareaAddedNodes',
    observe: ['addedNodes'],
    target: 'textarea[type="code"]',
    callback (mutation) {
        initElement(mutation.target);
    }
});

observer.init({ 
    name: 'CoCreateFilterObserver', 
    observe: ['attributes'],
    attributeName: ['type'],
    target: 'textarea[type="code"]',
    callback: function(mutation) {
        initElement(mutation.target);
    }
});

export default {initElement};