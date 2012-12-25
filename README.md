#Overview

This is a collection of [Pagedown][2] plugins to enable support for 
Markdown Extra syntax. Open `demo/demo.html` to try it yourself.

## Usage

In order to use the extensions, you'll need to include
`Markdown.Extra.js` after the Pagedown sources. Check out the
demo for a working example.

To get started using *all* available extensions, just add a preConversion
hook to your converter, like so:

```javascript
var converter = new Markdown.Converter();
converter.hooks.chain("preConversion", Markdown.Extra.all);
```

Otherwise, you can pick and choose from the extensions currently supported:

```javascript
// ascii tables
converter.hooks.chain("preConversion", Markdown.Extra.tables);
// fenced code blocks 
converter.hooks.chain("preConversion", Markdown.Extra.fencedCodeBlocks);
```

### Tables

Markdown.Extra supports ascii-formatted tables:

```markdown
| Item      | Value | Qty |
| --------- | -----:|:--: |
| Computer  | $1600 | 5   |
| Phone     |   $12 | 12  |
| Pipe      |    $1 |234  |
```

Which will render to something like this depending on how you choose to style it:

| Item      | Value | Qty |
| --------- | -----:|:--: |
| Computer  | $1600 | 5   |
| Phone     |   $12 | 12  |
| Pipe      |    $1 |234  |

You can also specify a class for the generated tables using
`Markdown.Extra.setup({tables: {tableClass: "table table-striped"} })` for instance.

See PHP Markdown Extra's [documentation][1] for a more complete overview
of table syntax.

### Fenced Code Blocks

Fenced code blocks are supported &agrave; la GitHub. This markdown:

    ```javascript
    var x = 2;
    ```

Will be transformed into:

```html
<pre>
    <code>var x = 2;</code>
</pre>
```

You can specify a syntax highlighter by passing an options object to `Markdown.Extra.setup`.
Both [google-code-prettify][3] and [Highlight.js][4] are currently supported:

```javascript
// highlighter can be either `prettify` or `highlight`
Markdown.Extra.setup({fencedCodeBlocks: {highlighter:"prettify"}});
```

If either of those is specified, the language type will be added to the code tag, e.g.
`<code class="language-javascript">`. If `prettify` is specified, `<pre>` also becomes
`<pre class="prettyprint">`. Otherwise, the markup is the same as what Pagedown
produces for regular indented code blocks. See the demo for an example
using [google-code-prettify][3].

## Important

Also note that these extensions only work with the vanilla Markdown converter. If you
use the converter returned by `Markdown.getSanitizingConverter()`, all of
the `table`-related tags and `code` tags will be stripped from the output.

##License

MIT: http://justinm.mit-license.org

[1]: http://michelf.ca/projects/php-markdown/extra/#table "Markdown Extra Table Documentation"
[2]: http://code.google.com/p/pagedown/ "Pagedown - Google Code"
[3]: http://code.google.com/p/google-code-prettify/ "Prettify"
[4]: http://softwaremaniacs.org/soft/highlight/en/ "HighlightJs"


