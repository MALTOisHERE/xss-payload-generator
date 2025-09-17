
export enum PayloadType {
  General = 'General XSS',
  Keylogger = 'Keylogger',
  CookieTheft = 'Cookie Theft',
}

export enum ContextType {
  HTML = 'html_tag',
  JS_STRING = 'js_string',
  ATTRIBUTE = 'attribute',
}

export interface GeneratorOptions {
  payloadType: PayloadType;
  contexts: ContextType[];
  allowedChars: string[];
  tags: string[];
  attributes: string[];
  attackerHost: string;
}
