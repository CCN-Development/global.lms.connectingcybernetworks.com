"use client";

import React from "react";
import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
    "p", "br", "strong", "b", "em", "i", "u", "s", "code", "pre", "mark",
    "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "hr", "a", "span",
];

/** Highlights a search term without breaking markup (text nodes only). */
function highlight(html: string, term: string) {
    const clean = term.trim();
    if (!clean) return html;
    const re = new RegExp(`(${clean.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    return html.replace(/>([^<]+)</g, (_m, text: string) => `>${text.replace(re, "<mark>$1</mark>")}<`);
}

type Props = { html: string; searchTerm?: string; className?: string };

/** Chat message renderer — always sanitises before injecting markup. */
export default function ChatRichText({ html, searchTerm = "", className = "" }: Props) {
    const marked = highlight(html, searchTerm);
    const safe = DOMPurify.sanitize(marked, {
        ALLOWED_TAGS,
        ALLOWED_ATTR: ["href", "target", "rel"],
        ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|\/)/i,
    });

    return <div className={`rich-text chat-rich ${className}`} dangerouslySetInnerHTML={{ __html: safe }} />;
}
