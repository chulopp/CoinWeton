import fs from "fs";
import path from "path";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

export default function TermsPage() {
  const filePath = path.join(process.cwd(), "data", "terms.md");
  const content = fs.readFileSync(filePath, "utf8");

  return (
    <div className="flex min-h-screen flex-col">

      <main className="flex-1 bg-background py-12">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-8 border-b border-slate-800 pb-8 gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">Terms of Service</h1>
              <p className="text-slate-400 text-sm">Last updated: April 29, 2026</p>
            </div>
            <div className="flex flex-col items-start md:items-end gap-2">
              <span className="text-xs text-slate-500 font-medium">Need to check our privacy policy?</span>
              <Link 
                href="/privacy"
                className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm font-semibold text-white hover:bg-slate-800 transition-all group"
              >
                Privacy Policy
                <ArrowUpRight className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
              </Link>
            </div>
          </div>
          
          <div className="markdown-content">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({ ...props }) => <h1 className="text-3xl font-bold mb-6 text-white" {...props} />,
                h2: ({ ...props }) => <h2 className="text-2xl font-bold mt-10 mb-4 text-white border-b border-slate-800 pb-2" {...props} />,
                h3: ({ ...props }) => <h3 className="text-xl font-bold mt-8 mb-3 text-slate-200" {...props} />,
                p: ({ ...props }) => <p className="text-slate-400 leading-relaxed mb-4 text-[15px]" {...props} />,
                ul: ({ ...props }) => <ul className="list-disc pl-6 mb-4 space-y-2 text-slate-400 text-[15px]" {...props} />,
                li: ({ ...props }) => <li {...props} />,
                blockquote: ({ ...props }) => (
                  <blockquote 
                    className="my-10 mx-auto max-w-2xl rounded-2xl border border-cyan-500/30 bg-cyan-900/10 px-8 py-6 text-center text-lg font-semibold text-cyan-50 italic shadow-[0_0_40px_rgba(0,229,255,0.05)] ring-1 ring-cyan-500/10 [&>p]:mb-0 [&>p]:text-center" 
                    {...props} 
                  />
                ),
                table: ({ ...props }) => (
                  <div className="overflow-x-auto my-8">
                    <table className="w-full text-left border-collapse border border-slate-800 rounded-lg overflow-hidden" {...props} />
                  </div>
                ),
                thead: ({ ...props }) => <thead className="bg-slate-900" {...props} />,
                th: ({ ...props }) => <th className="px-4 py-3 text-sm font-bold text-slate-200 border-b border-slate-800" {...props} />,
                td: ({ ...props }) => <td className="px-4 py-3 text-sm text-slate-400 border-b border-slate-800" {...props} />,
                hr: ({ ...props }) => <hr className="my-10 border-slate-800" {...props} />,
                strong: ({ ...props }) => <strong className="font-bold text-slate-200" {...props} />,
                a: ({ ...props }) => <a className="text-cyan-400 hover:underline" {...props} />,
              }}
            >
              {content}
            </ReactMarkdown>
          </div>
        </div>
      </main>

    </div>
  );
}
