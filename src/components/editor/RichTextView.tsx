import DOMPurify from "isomorphic-dompurify";

const ALLOWED_TAGS = [
    "p", "br", "strong", "b", "em", "i", "u", "s", "code", "pre",
    "h1", "h2", "h3", "ul", "ol", "li", "blockquote", "hr", "a", "span",
];

/** Renders editor HTML after sanitising it (never trust stored markup). */
export default function RichTextView({
    html,
    className = "",
    allowClassAttr = false,
}: {
    html: string;
    className?: string;
    /** Keeps `class` attributes (e.g. community @mention spans). */
    allowClassAttr?: boolean;
}) {
    const clean = DOMPurify.sanitize(html, {
        ALLOWED_TAGS,
        ALLOWED_ATTR: allowClassAttr ? ["href", "target", "rel", "class"] : ["href", "target", "rel"],
        ALLOWED_URI_REGEXP: /^(?:https?:|mailto:|#|\/)/i,
    });

    return <div className={`rich-text ${className}`} dangerouslySetInnerHTML={{ __html: clean }} />;
}
