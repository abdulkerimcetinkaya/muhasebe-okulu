package com.example.muhasebeokulu5.util;

import org.jsoup.Jsoup;
import org.jsoup.safety.Safelist;
import org.springframework.stereotype.Component;

/**
 * HTML Sanitization utility using Jsoup
 * Protects against XSS attacks while allowing educational content formatting
 */
@Component
public class HtmlSanitizer {

    private static final Safelist EDUCATIONAL_CONTENT_WHITELIST;

    static {
        // Create custom whitelist for educational content
        EDUCATIONAL_CONTENT_WHITELIST = Safelist.relaxed()
                // Basic formatting
                .addTags("p", "br", "span", "div")
                .addTags("h1", "h2", "h3", "h4", "h5", "h6")
                .addTags("strong", "b", "em", "i", "u", "s", "mark")
                // Lists
                .addTags("ul", "ol", "li")
                // Tables (important for accounting content)
                .addTags("table", "thead", "tbody", "tfoot", "tr", "th", "td", "caption")
                .addAttributes("table", "class", "style")
                .addAttributes("th", "class", "style", "colspan", "rowspan")
                .addAttributes("td", "class", "style", "colspan", "rowspan")
                // Code and quotes
                .addTags("blockquote", "pre", "code")
                // Links and images (with restrictions)
                .addTags("a", "img")
                .addAttributes("a", "href", "target", "rel")
                .addAttributes("img", "src", "alt", "width", "height", "class", "style")
                .addProtocols("a", "href", "http", "https", "mailto")
                .addProtocols("img", "src", "http", "https", "data")
                // Horizontal rule
                .addTags("hr")
                // Allow common attributes
                .addAttributes(":all", "class", "id", "style");
    }

    /**
     * Sanitize HTML content to prevent XSS attacks
     *
     * @param html Raw HTML content
     * @return Sanitized HTML safe for display
     */
    public String sanitize(String html) {
        if (html == null || html.isEmpty()) {
            return "";
        }

        return Jsoup.clean(html, EDUCATIONAL_CONTENT_WHITELIST);
    }

    /**
     * Sanitize HTML and convert to plain text (removes all HTML tags)
     *
     * @param html Raw HTML content
     * @return Plain text without any HTML tags
     */
    public String toPlainText(String html) {
        if (html == null || html.isEmpty()) {
            return "";
        }

        return Jsoup.parse(html).text();
    }

    /**
     * Check if HTML content is safe (doesn't contain malicious code)
     *
     * @param html HTML content to check
     * @return true if content is safe, false otherwise
     */
    public boolean isSafe(String html) {
        if (html == null || html.isEmpty()) {
            return true;
        }

        String cleaned = sanitize(html);
        return html.equals(cleaned);
    }
}
