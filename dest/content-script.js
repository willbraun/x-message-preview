"use strict";
;
(function () {
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });
    const styleLink = document.createElement('link');
    styleLink.rel = 'stylesheet';
    styleLink.href = chrome.runtime.getURL('styles.css');
    shadowRoot.appendChild(styleLink);
    const bubble = document.createElement('div');
    bubble.classList.add('message-preview-bubble');
    const margin = 20;
    const windowHeight = window.innerHeight;
    bubble.textContent = '';
    const maxHeight = windowHeight - margin * 4;
    bubble.style.setProperty('max-height', `${maxHeight}px`);
    const fontSize = '24px';
    bubble.style.setProperty('font-size', fontSize);
    shadowRoot.appendChild(bubble);
    document.body.appendChild(shadowRoot);
    const setUpEventListeners = (container) => {
        const boxes = [...container.querySelectorAll('li')];
        Array.from(boxes).forEach(box => {
            var _a, _b, _c, _d, _e, _f;
            // get the message text from the nested structure of the box
            const message = (_f = (_e = (_d = (_c = (_b = (_a = box === null || box === void 0 ? void 0 : box.children[0]) === null || _a === void 0 ? void 0 : _a.children[0]) === null || _b === void 0 ? void 0 : _b.children[0]) === null || _c === void 0 ? void 0 : _c.children[1]) === null || _d === void 0 ? void 0 : _d.children[1]) === null || _e === void 0 ? void 0 : _e.textContent) !== null && _f !== void 0 ? _f : '';
            // on mouseenter, calculate styles and show bubble
            box.addEventListener('mouseenter', () => {
                bubble.textContent = message;
                bubble.style.setProperty('max-width', '400px');
                bubble.style.setProperty('font-size', fontSize);
                const bubbleRect1 = bubble.getBoundingClientRect();
                const boxRect = box.getBoundingClientRect();
                const boxRight = boxRect.x + boxRect.width;
                bubble.style.setProperty('left', `${boxRight + margin}px`);
                if (bubbleRect1.height >= maxHeight) {
                    bubble.style.setProperty('max-width', `${window.innerWidth - boxRight - margin * 4}px`);
                    bubble.style.setProperty('top', `${margin}px`);
                    // shrink font until bubble fits on screen
                    while (bubble.scrollHeight > bubbleRect1.height) {
                        const currentFontSize = Number(bubble.style.fontSize.split('px')[0]);
                        bubble.style.setProperty('font-size', `${currentFontSize - 1}px`);
                    }
                }
                else {
                    bubble.style.setProperty('top', `${boxRect.y + (boxRect.height - bubbleRect1.height) / 2}px`);
                    const bubbleRect2 = bubble.getBoundingClientRect();
                    // if bubble goes off top
                    if (bubbleRect2.y < margin) {
                        bubble.style.setProperty('top', `${margin}px`);
                    }
                    // if bubble goes off bottom
                    if (bubbleRect2.y + bubbleRect2.height > windowHeight - margin) {
                        bubble.style.setProperty('top', `${windowHeight - bubbleRect2.height - margin}px`);
                    }
                }
                bubble.classList.add('show-bubble');
            });
            // on mouseleave, hide bubble
            box.addEventListener('mouseleave', () => {
                bubble.classList.remove('show-bubble');
            });
        });
    };
    const setUpMouseOver = (container) => {
        setUpEventListeners(container);
        const mutationObserver = new MutationObserver(_ => setUpEventListeners(container));
        mutationObserver.observe(container, { childList: true, subtree: true });
    };
    const findContainer = (intervalId) => {
        const container = document.querySelector('[role="listbox"]');
        if (container) {
            setUpMouseOver(container);
            clearInterval(intervalId);
        }
    };
    const attachBubble = () => {
        // check every 100ms, then every 2s, then give up after 20 tries of each
        let count1 = 0;
        let count2 = 0;
        const intervalId1 = setInterval(() => {
            findContainer(intervalId1);
            count1++;
            if (count1 === 20) {
                clearInterval(intervalId1);
                const intervalId2 = setInterval(() => {
                    findContainer(intervalId2);
                    count2++;
                    if (count2 === 20) {
                        clearInterval(intervalId2);
                    }
                }, 2000);
            }
        }, 100);
    };
    if (window.location.pathname.includes('/i/chat')) {
        attachBubble();
    }
    // Navigation API is supported in Chrome
    if ('navigation' in window) {
        ;
        window.navigation.addEventListener('navigate', (event) => {
            if (event.destination.url.includes('x.com/i/chat')) {
                attachBubble();
            }
        });
    }
})();
