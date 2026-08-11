import React, { useState } from 'react'
import "../styles/chat.css"
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
function CodeBlock({ children }) {
    const [copied, setCopied] = useState(false);
    const language = children?.props?.className?.replace("language-", "") || "";
    const handleCopy = () => {
        const code = children?.props?.children;
        const text = typeof code === "string" ? code : String(code).replace(/\n$/, "");
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };
    return (
        <div className="code-block">
            <div className="code-block-header">
                <span className="code-language">{language || "code"}</span>
                <button className="copy-btn" onClick={handleCopy} >
                    {copied ? "Copied!" : "Copy"}
                </button>
            </div>
            {children}
        </div>
    );
}
export default function Chat({ message, sender }) {
    const isUser = sender === "user";
    return (
        <div className={`chat-row ${isUser ? "chat-row--user" : ""}`}>
            <div className={`chat-bubble ${isUser ? "chat-bubble--user" : "chat-bubble--ai"}`}>
                {!isUser ? <ReactMarkdown
                    components={{
                        pre({ children }) {
                            return <CodeBlock>{children}</CodeBlock>;
                        },
                        code({ className, children }) {
                            const language = className?.replace("language-", "") || "";
                            const isBlock = Boolean(language);
                            return isBlock ? (
                                <SyntaxHighlighter style={oneDark} language={language} PreTag="div" customStyle={{ margin: 0, borderRadius: 0 }}>
                                    {String(children).replace(/\n$/, "")}
                                </SyntaxHighlighter>
                            ) : (
                                <code className="inline-code">{children}</code>
                            );
                        },
                    }}
                >

                    {message}
                </ReactMarkdown> : message}
            </div>
        </div>
    );
}