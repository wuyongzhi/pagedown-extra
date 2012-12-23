## Overview

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

| Item      | Value |
| --------- | -----:|
| Computer  | $1600 |
| Phone     |   $12 |
| Pipe      |    $1 |

See PHP Markdown Extra's [documentation][1] for a more complete overview
of table syntax.

Also note that this only works with the vanilla Markdown converter. If you
use the converter returned by `Markdown.getSanitizingConverter()`, all of
the table-related tags will be stripped from the output.


License: [MIT](justinm.mit-license.org)

[1]: http://michelf.ca/projects/php-markdown/extra/#table "Markdown Extra Table Documentation"
[2]: http://code.google.com/p/pagedown/ "Pagedown - Google Code"
