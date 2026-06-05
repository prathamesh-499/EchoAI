import React from 'react'
import "../styles/chat.css"
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
export default function Chat({ prompt, by }) {
	return (

		<div className={` w-75 m-auto p-2 d-flex flex-wrap flex-row ${by === "user" ? "justify-content-end" : "justify-content-start"}`}>
			<div className="markdown-body ">
				<ReactMarkdown
					components={{
						pre({ children }) {
							return <div className="code-block">{children}</div>;
						},
						code({ className, children }) {
							const language = className?.replace("language-", "") || "";
							const isBlock = Boolean(language); // language class is ONLY on fenced code blocks

							return isBlock ? (
								<SyntaxHighlighter style={oneDark} language={language} PreTag="div">
									{String(children).replace(/\n$/, "")}
								</SyntaxHighlighter>
							) : (
								<code className={className}>{children}</code>
							);
						},
					}}
				>
					{prompt}
				</ReactMarkdown>
			</div>
		</div>
	)
}
