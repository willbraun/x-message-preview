"use strict";
;
(function () {
    const shadowRoot = document.createElement('div').attachShadow({ mode: 'open' });
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
        const boxes = [...container.children].slice(1, -1);
        Array.from(boxes).forEach(box => {
            var _a;
            const textElement = box.querySelector('[data-testid="tweetText"]');
            const message = (_a = textElement === null || textElement === void 0 ? void 0 : textElement.textContent) !== null && _a !== void 0 ? _a : '';
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
        const container = document.querySelector('[role="tablist"]');
        if (container) {
            setUpMouseOver(container);
            clearInterval(intervalId);
        }
    };
    const attachBubble = () => {
        // check every 10ms, then every 2s, then give up after 20 tries of each
        let count1 = 0;
        let count2 = 0;
        const intervalId1 = setInterval(() => {
            findContainer(intervalId1);
            count1++;
            if (count1 === 200) {
                clearInterval(intervalId1);
                const intervalId2 = setInterval(() => {
                    findContainer(intervalId2);
                    count2++;
                    if (count2 === 20) {
                        clearInterval(intervalId2);
                    }
                }, 2000);
            }
        }, 10);
    };
    attachBubble();
    // Navigation API is supported in Chrome
    if ('navigation' in window) {
        ;
        window.navigation.addEventListener('navigate', (event) => {
            if (event.destination.url.includes('x.com/messages')) {
                attachBubble();
            }
        });
    }
})();
