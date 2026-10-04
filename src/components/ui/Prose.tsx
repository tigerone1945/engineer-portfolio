type Props = { html: string };

// html must come from markdownToHtml(), which sanitizes the output.
export default function Prose({ html }: Props) {
  return <div className="prose-content" dangerouslySetInnerHTML={{ __html: html }} />;
}
