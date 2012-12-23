verview

This is a collection of Pagedown plugins to enable support for 
Markdown Extra syntax. Open `demo/demo.html` to try it yourself.

## Usage 

In order to use the extensions, you'll need to include
`Markdown.Extra.js` after the [Pagedown sources][2]. Check out the
demo for a working example.

### Tables

Only tables are working currently. To support tables in your editor, you
just need to add a preConversion hook to your converter, like so:

```javascript
var converter = new Markdown.Converter();
converter.hooks.chain("preConversion", Markdown.Extra.tables);
```

Now you can use nice ascii-formatted tables:

```markdown
| Item      | Value | Qty |
| --------- | -----:|:--: |
| Computer  | $1600 | 5   |
| Phone     |   $12 | 12  |
| Pipe      |    $1 |234  |
```

Which would render to something like this depending on how you choose to style it:

| Item      | Value | Qty |
| --------- | -----:|:--: |
| Computer  | $1600 | 5   |
| Phone     |   $12 | 12  |
| Pipe      |    $1 |234  |

See PHP Markdown Extra's [documentation][1] for a more complete overview
of table syntax.

### Fenced Code Blocks

Fenced code blocks are supported &agrave; la GitHub:

```javascript
var foo = 'bar';

// a random comment
function foo() {
    console.log("Hi!");
}
```

You can specify a highlighter by passing an options object to `Markdown.Extra.setup`:

```javascript
// highlighter can be either `prettify` or `highlight`
Markdown.Extra.setup({fencedCodeBlocks: {highlighter:"prettify"}});
```

Both [google-code-prettify][3] and [Highlight.js][4] are currently supported.
For example, given the following markdown:

    ```javascript
    var x = 2;
    ```

Using google-code-prettify, it becomes:

```html
<pre class="highlight">
   <code class="language-javascript">var x = 2;</code>
</pre>
```

And using highlight.js:
```html
<pre>
   <code class="language-javascript">var x = 2;</code>
</pre>
```

Currently, the default is just to add the class `wmd-code-block` to the `<code>` tag:
```html
<pre>
   <code class="wmd-code-block">var x = 2;</code>
</pre>
```

It's up to you to include the corresponding js and css so that these are styled appropriately. See
the demo for an example using highlight.js.

## Important

Also note that these extensions only work with the vanilla Markdown converter. If you
use the converter returned by `Markdown.getSanitizingConverter()`, all of
the `table`-related tags and `code` tags will be stripped from the output.

###License

MIT: http://justinm.mit-license.org

[1]: http://michelf.ca/projects/php-markdown/extra/#table "Markdown Extra Table Documentation"
[2]: http://code.google.com/p/pagedown/ "Pagedown - Google Code"
[3]: http://code.google.com/p/google-code-prettify/ "Prettify"
[4]: http://softwaremaniacs.org/soft/highlight/en/ "Highlight.js"


