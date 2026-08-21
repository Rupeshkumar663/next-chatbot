import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type MessageProps = {
    role: "user" | "assistant";
    content: string;
};

function Message({ role, content }: MessageProps) {

    return (
        <div
            className={`flex mb-5 ${
                role === "user"
                    ? "justify-end"
                    : "justify-start"
            }`}
        >
            <div
                className={`max-w-[85%] md:max-w-[75%] break-words leading-7 ${
                    role === "user"
                        ? "bg-[#444654] rounded-2xl px-4 py-3 whitespace-pre-wrap"
                        : "bg-transparent"
                }`}
            >
                {role === "user" ? (

                    content

                ) : (

                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{

                            h1: ({ children }) => (
                                <h1 className="text-3xl font-bold mt-6 mb-4">
                                    {children}
                                </h1>
                            ),

                            h2: ({ children }) => (
                                <h2 className="text-2xl font-bold mt-6 mb-3">
                                    {children}
                                </h2>
                            ),

                            h3: ({ children }) => (
                                <h3 className="text-xl font-semibold mt-5 mb-3">
                                    {children}
                                </h3>
                            ),

                            p: ({ children }) => (
                                <p className="mb-4">
                                    {children}
                                </p>
                            ),

                            ul: ({ children }) => (
                                <ul className="list-disc pl-6 mb-4 space-y-1">
                                    {children}
                                </ul>
                            ),

                            ol: ({ children }) => (
                                <ol className="list-decimal pl-6 mb-4 space-y-1">
                                    {children}
                                </ol>
                            ),

                            li: ({ children }) => (
                                <li className="mb-1">
                                    {children}
                                </li>
                            ),

                            strong: ({ children }) => (
                                <strong className="font-bold text-white">
                                    {children}
                                </strong>
                            ),

                            code: ({ children, className }) => {

                                const isCodeBlock =
                                    className?.includes("language-");

                                return isCodeBlock ? (

                                    <code className={className}>
                                        {children}
                                    </code>

                                ) : (

                                    <code className="bg-[#303030] px-1.5 py-0.5 rounded text-sm">
                                        {children}
                                    </code>

                                );
                            },

                            pre: ({ children }) => (
                                <pre className="bg-[#171717] p-4 rounded-xl overflow-x-auto mb-5">
                                    {children}
                                </pre>
                            ),

                            blockquote: ({ children }) => (
                                <blockquote className="border-l-4 border-gray-500 pl-4 my-4 text-gray-300">
                                    {children}
                                </blockquote>
                            ),

                            table: ({ children }) => (
                                <div className="overflow-x-auto my-5">
                                    <table className="w-full border-collapse">
                                        {children}
                                    </table>
                                </div>
                            ),

                            th: ({ children }) => (
                                <th className="border border-gray-600 px-3 py-2 text-left font-semibold">
                                    {children}
                                </th>
                            ),

                            td: ({ children }) => (
                                <td className="border border-gray-700 px-3 py-2">
                                    {children}
                                </td>
                            ),

                            hr: () => (
                                <hr className="border-gray-700 my-6" />
                            ),

                            a: ({ children, href }) => (
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-400 underline"
                                >
                                    {children}
                                </a>
                            )
                        }}
                    >
                        {content}
                    </ReactMarkdown>

                )}

            </div>
        </div>
    );
}

export default Message;