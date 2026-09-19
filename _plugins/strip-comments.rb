# frozen_string_literal: true

# ── THE NOTES DO NOT SHIP ────────────────────────────────────────────────────
# Measured on the live site: the home page is 1.55MB of HTML, and 54% of it
# is commentary -- the working notes in every inline <style> and <script>,
# plus the HTML comments, which jekyll-minifier strips on other pages but not
# on index.html, where it is excluded because its compressor also strips body
# content there. The CSS and JS compressors are off for a similar reason:
# cssminify2 mangles var() inside calc().
#
# This does one narrow thing those tools could not do safely: it removes
# comments and nothing else. No whitespace collapsing, no minification, no
# rewriting of anything that runs. Three patterns, each chosen to match what
# a browser's own parser would treat as a comment:
#
#   <!-- ... -->            HTML comments, anywhere outside <script>/<style>.
#   /* ... */               Block comments that START a line, inside <style>
#                           and <script>. Only line-leading ones, so a `/*`
#                           inside a string, a regex or a glob is never
#                           touched. Everything written as a note here is a
#                           line-leading block.
#   //                      Whole-line comments inside <script> only: a line
#                           whose first non-blank characters are `//`. Never
#                           a trailing comment after code, where a `//` in a
#                           string or a regex would be a false positive.
#                           `//#` and `//@` directives are kept.
#
# Production only, because the notes are the point of the source and a
# development build should look like the source. STRIP_COMMENTS=1 forces it
# locally so the result can be checked before a deploy.
# ─────────────────────────────────────────────────────────────────────────────

module StripComments
  HTML_COMMENT = /<!--(?!\[if)(?:(?!-->).)*-->/m
  # A block comment whose opening `/*` is the first non-blank thing on its
  # line, through the first `*/`, and the line break that followed it.
  LEADING_BLOCK = %r{^[ \t]*/\*(?:(?!\*/).)*\*/[ \t]*\n?}m
  LEADING_LINE = %r{^[ \t]*//(?![#@]).*\n?}
  SEGMENT = %r{(<(script|style)\b[^>]*>)(.*?)(</\2>)}mi

  def self.strip(html)
    html = html.gsub(SEGMENT) do
      open_tag, _kind, body, close_tag = Regexp.last_match(1), Regexp.last_match(2), Regexp.last_match(3), Regexp.last_match(4)
      # JSON data blocks and templates are data, not code: leave them alone.
      if open_tag =~ /type\s*=\s*["']?(application\/(ld\+)?json|text\/template|text\/x-)/i
        "#{open_tag}#{body}#{close_tag}"
      else
        out = body.gsub(LEADING_BLOCK, '')
        out = out.gsub(LEADING_LINE, '') if _kind.casecmp('script').zero?
        "#{open_tag}#{out}#{close_tag}"
      end
    end
    # HTML comments outside code. Split around script/style so a `<!--`
    # inside a script string cannot start a match.
    parts = html.split(SEGMENT_SPLIT)
    parts.map { |p| p =~ /\A<(script|style)\b/i ? p : p.gsub(HTML_COMMENT, '') }.join
  end

  SEGMENT_SPLIT = %r{(<(?:script|style)\b[^>]*>.*?</(?:script|style)>)}mi

  def self.enabled?
    Jekyll.env == 'production' || ENV['STRIP_COMMENTS'] == '1'
  end
end

Jekyll::Hooks.register :site, :post_write do |site|
  next unless StripComments.enabled?

  before = 0
  after = 0
  Dir.glob(File.join(site.dest, '**', '*.html')).each do |path|
    src = File.read(path, encoding: 'UTF-8')
    out = StripComments.strip(src)
    before += src.bytesize
    after += out.bytesize
    File.write(path, out) if out != src
  end
  Jekyll.logger.info 'StripComments:', "#{(before / 1024 / 1024.0).round(1)}MB -> #{(after / 1024 / 1024.0).round(1)}MB of HTML"
end
