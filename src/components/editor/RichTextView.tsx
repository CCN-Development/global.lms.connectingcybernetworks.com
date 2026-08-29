import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
    "p", "br", "strong", "b", "em", "i", "u", "s", "code", "pre",
    "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "hr", "a", "span",
];

/** Renders editor HTML after sanitising it (never trust stored markup). */
export default function RichTextView({ html, className = "" }: { html: string; className?: string }) {
    const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR: ["href", "target", "rel"],
        ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|\/)/i,
    });

    return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
