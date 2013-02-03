(function () {

  /******************************************************************
   * Utility Functions                                              *
   *****************************************************************/

  function trim(str) {
    return str.replace(/^\s+|\s+$/g, '');
  }

  function contains(str, substr) {
    return str.indexOf(substr) != -1;
  }

  // Sanitizes html, removing tags that aren't in the whitelist
  function sanitizeHtml(html, whitelist) {
    return html.replace(/<[^>]*>?/gi, function(tag) {
      return tag.match(whitelist) ? tag : '';
    });
  }

  // Converte escpaed special characters to HTLM decimal entity codes.
  function processEscapes(text) {
    // Markdown extra adds two escapable characters, `:` and `|`
    // If escaped, we convert them to html entities so our
    // regexes don't recognize them. Markdown doesn't support escaping
    // the escape character, e.g. `\\`, which make this even simpler.
    return text.replace(/\\\|/g, '&#124;').replace(/\\:/g, '&#58;');
  }


  /******************************************************************
   * Markdown.Extra                                                 *
   *****************************************************************/

  Markdown.Extra = function() {
    // For converting internal markdown (in tables for instance).
    // This is necessary since these methods are meant to be called as
    // preConversion hooks, and the Markdown converter passed to init()
    // won't convert any markdown contained in the html tags we return.
    this.converter = null;

    // Stores html blocks we generate in hooks so that
    // they're not destroyed if the user is using a sanitizing converter
    this.hashBlocks = [];

    // Fenced code block options
    this.googleCodePrettify = false;
    this.highlightJs = false;

    // Table options
    this.tableClass = '';

    this.tabWidth = 4;
  };

  Markdown.Extra.init = function(converter, options) {
    // Each call to init creates a new instance of Markdown.Extra so it's
    // safe to have multiple converters, with different options, on a single page
    var extra = new Markdown.Extra();
    var transformations = [];

    options = options || {};
    options.extensions = options.extensions || ["all"];
    if (contains(options.extensions, "all")) {
      transformations.push("all");
    } else {
      if (contains(options.extensions, "tables"))
        transformations.push("tables");
      else if (contains(options.extensions, "fenced_code_gfm"))
        transformations.push("fencedCodeBlocks");
    }

    // preBlockGamut also gives us access to a hook so we can run the
    // block gamut recursively, however we don't need it at this point
    converter.hooks.chain("preBlockGamut", function(text) {
      return extra.doConversion(transformations, text);
    });

    converter.hooks.chain("postConversion", function(text) {
      return extra.finishConversion(text);
    });

    if ("highlighter" in options) {
      extra.googleCodePrettify = options.highlighter === 'prettify';
      extra.highlightJs = options.highlighter === 'highlight';
    }

    if ("table_class" in options) {
      extra.tableClass = options.table_class;
    }

    // we can't just use the same converter that the user passes in, as
    // Pagedown forbids it (doing so could cause an infinite loop)
    if (!("sanitize" in options) || options.sanitize) {
      extra.converter = Markdown.getSanitizingConverter(); // default
    } else {
      extra.converter = new Markdown.Converter();
    }

    // Caller usually won't need this, but it's handy for testing.
    return extra;
  };

  // Setup state vars, do conversion
  Markdown.Extra.prototype.doConversion = function(transformations, text) {
    this.hashBlocks = [];

    text = processEscapes(text);
    for(var i = 0; i < transformations.length; i++)
      text = this[transformations[i]](text);

    return text + '\n';
  };

  // Clear state vars that may use unnecessary memory. Unhash blocks we
  // stored and return converted text.
  Markdown.Extra.prototype.finishConversion = function(text) {
    text = this.unHashExtraBlocks(text);
    this.hashBlocks = [];
    return text;
  };

  // Return a placeholder containing a key, which is the block's index in the
  // hashBlocks array. We wrap our output in a <p> tag here so Pagedown won't.
  Markdown.Extra.prototype.hashExtraBlock = function(block) {
    return '<p>~X' + (this.hashBlocks.push(block) - 1) + 'X</p>';
  };

  // Replace placeholder blocks in `text` with their corresponding
  // html blocks in the hashBlocks array.
  Markdown.Extra.prototype.unHashExtraBlocks = function(text) {
    var self = this;
    text = text.replace(/<p>~X(\d+)X<\/p>/g, function(wholeMatch, m1) {
      key = parseInt(m1, 10);
      return self.hashBlocks[key];
    });
    return text;
  };


  /******************************************************************
   * Markdown.Extra                                                 *
   *****************************************************************/

  // Find and convert Markdown Extra tables into html.
  Markdown.Extra.prototype.tables = function(text) {
    // Needed for post-processing step after calling convert.makeHtml()
    // to keep only span-level tags inside tables per the PHP Markdown Extra spec.
    var inlineTags = new RegExp(['^(<\\/?(a|abbr|acronym|applet|area|b|basefont|',
                                 'bdo|big|button|cite|code|del|dfn|em|figcaption|',
                                 'font|i|iframe|img|input|ins|kbd|label|map|',
                                 'mark|meter|object|param|progress|q|ruby|rp|rt|s|',
                                 'samp|script|select|small|span|strike|strong|',
                                 'sub|sup|textarea|time|tt|u|var|wbr)>|',
                                 '<(br)\\s?\\/?>)$'].join(''), 'i');
    var self = this;

    /*
    var leadingPipe = new RegExp(['^',
                                  '[ ]{0,3}', // Allowed whitespace
                                  '[|]',      // Initial pipe
                                  '(.+)\\n',  // $1: Header Row

                                  '[ ]{0,3}',                 // Allowed whitespace
                                  '[|]([ ]*[-:]+[-| :]*)\\n', // $2: Separator

                                  '(',                    // $3: Table Body
                                    '(?:[ ]*[|].*\\n?)*', // Table rows
                                  ')',
                                  '(?:\\n|$)'             // Stop at final newline
                                 ].join(''),
                                 'gm');

    var noLeadingPipe = new RegExp(['^',
                                    '[ ]{0,3}',        // Allowed whitespace
                                    '(\\S.*[|].*)\\n', // $1: Header Row

                                    '[ ]{0,3}',                  // Allowed whitespace
                                    '([-:]+[ ]*[|][-| :]*)\\n', // $2: Separator

                                    '(',                  // $3: Table Body
                                      '(?:.*[|].*\\n?)*', // Table rows
                                    ')',
                                    '(?:\\n|$)'           // Stop at final newline
                                   ].join(''),
                                   'gm');
    */

    var leadingPipe = new RegExp("^[ ]{0,3}[|](.+)\\n[ ]{0,3}[|]([ ]*[-:]+[-| :]*)\\n((?:[ ]*[|].*\\n?)*)(?:\\n|$)", 'gm');
    var noLeadingPipe = new RegExp("^[ ]{0,3}(\\S.*[|].*)\\n[ ]{0,3}([-:]+[ ]*[|][-| :]*)\\n((?:.*[|].*\\n?)*)(?:\\n|$)", 'gm');

    text = text.replace(leadingPipe, doTable);
    text = text.replace(noLeadingPipe, doTable);

    // Convert markdown within the table, retaining only span-level tags
    function convertInline(text) {
      var html = self.converter.makeHtml(text);
      return sanitizeHtml(html, inlineTags);
    }

    // $1 = header, $2 = separator, $3 = body
    function doTable(match, header, separator, body, offset, string) {
      // remove any leading pipes and whitespace
      header = header.replace(/^ *[|]/m, '');
      separator = separator.replace(/^ *[|]/m, '');
      body = body.replace(/^ *[|]/gm, '');

      // remove trailing pipes and whitespace
      header = header.replace(/[|] *$/m, '');
      separator = separator.replace(/[|] *$/m, '');
      body = body.replace(/[|] *$/gm, '');

      // determine column alignments
      alignspecs = separator.split(/ *[|] */);
      align = [];
      for (var i = 0; i < alignspecs.length; i++) {
        var spec = alignspecs[i];
        if (spec.match(/^ *-+: *$/m))
          align[i] = ' style="text-align:right;"';
        else if (spec.match(/^ *:-+: *$/m))
          align[i] = ' style="text-align:center;"';
        else if (spec.match(/^ *:-+ *$/m))
          align[i] = ' style="text-align:left;"';
        else align[i] = '';
      }

      // TODO: parse spans in header and rows before splitting, so that pipes
      // inside of tags are not interpreted as separators
      var headers = header.split(/ *[|] */);
      var colCount = headers.length;

      // build html
      var cls = self.tableClass ? ' class="' + self.tableClass + '"' : '';
      var html = ['<table', cls, '>\n', '<thead>\n', '<tr>\n'].join('');

      // build column headers.
      for (i = 0; i < colCount; i++)
        html += ["  <th", align[i], ">", convertInline(trim(headers[i])), "</th>\n"].join('');
      html += "</tr>\n</thead>\n";

      // build rows
      var rows = body.split('\n');
      for (i = 0; i < rows.length; i++) {
        if (rows[i].match(/^\s*$/)) // can apply to final row
          continue;

        // ensure number of rowCells matches colCount
        var rowCells = rows[i].split(/ *[|] */);
        var lenDiff = colCount - rowCells.length;
        for (var j = 0; j < lenDiff; j++)
          rowCells.push('');

        html += "<tr>\n";
        for (j = 0; j < colCount; j++)
          html += ["  <td", align[j], ">", convertInline(trim(rowCells[j])), "</td>\n"].join('');
        html += "</tr>\n";
      }

      html += "</table>\n";

      // replace html with placeholder until postConversion step
      return self.hashExtraBlock(html);
    }

    return text;
  };


  /******************************************************************
   * Markdown.Extra                                                 *
   *****************************************************************/

  // Find and convert gfm-inspired fenced code blocks into html.
  Markdown.Extra.prototype.fencedCodeBlocks = function(text) {
    function encodeCode(code) {
      code = code.replace(/&/g, "&amp;");
      code = code.replace(/</g, "&lt;");
      code = code.replace(/>/g, "&gt;");
      return code;
    }

    var self = this;
    text = text.replace(/(?:^|\n)```(.*)\n([\s\S]*?)\n```/g, function(match, m1, m2) {
      var language = m1, codeblock = m2;

      // adhere to specified options
      var preclass = self.googleCodePrettify ? ' class="prettyprint"' : '';
      var codeclass = '';
      if (language) {
        if (self.googleCodePrettify || self.highlightJs) {
          // use html5 language- class names. supported by both prettify and highlight.js
          codeclass = ' class="language-' + language + '"';
        } else {
          codeclass = ' class="' + language + '"';
        }
      }

      var html = ['<pre', preclass, '><code', codeclass, '>',
                  encodeCode(codeblock), '</code></pre>'].join('');

      // replace codeblock with placeholder until postConversion step
      return self.hashExtraBlock(html);
    });

    return text;
  };

  Markdown.Extra.prototype.all = function(text) {
    text = this.tables(text);
    text = this.fencedCodeBlocks(text);
    return text;
  };

})();

