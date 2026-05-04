import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'

interface TheoryContentProps {
  content: string
}

export default function TheoryContent({ content }: TheoryContentProps) {
  return (
    <div className="prose prose-slate max-w-none prose-sqld">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}
