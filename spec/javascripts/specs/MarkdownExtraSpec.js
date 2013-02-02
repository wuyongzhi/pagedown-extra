describe("Markdown.Extra", function() {
  // basic code block
  var codeBlock = "```foolang\nfoo=bar;\n```";
  // expected code block html
  var codeBlockHtml ='<pre><code class="foolang">foo=bar;</code></pre>';

  // basic table
  var table = "h1 | h2 | h3\n:- | :-: | -:\n1 | 2 | 3";
  var tableVerbose = "| h1 | h2 | h3 |\n| :- | :-: | -: |\n| 1 | 2 | 3 |";
  // expected table html
  var tableHtml ='<table class="wmd-table">\n' +
    '<thead>\n' +
    '<tr>\n' +
    '  <th style="text-align:left;">h1</th>\n' +
    '  <th style="text-align:center;">h2</th>\n' +
    '  <th style="text-align:right;">h3</th>\n' +
    '</tr>\n' +
    '</thead>\n' +
    '<tr>\n' +
    '  <td style="text-align:left;">1</td>\n' +
    '  <td style="text-align:center;">2</td>\n' +
    '  <td style="text-align:right;">3</td>\n' +
    '</tr>\n' +
    '</table>';

  // table containing inline and block-level tags and markdown
  var tableComplex = "h1|h2|h3\n-|-|-\n`code`|##hdr##|<script></script>";

  // some basic markdown without extensions
  var markdown = "#TestHeader\n_This_ is *markdown*" +
    "\n\nCool. And a link: [google](http://www.google.com)";

  function strip(str) {
    return str.replace(/^\s+|\s+$/g, '');
  }

  describe("when setting options", function() {
    var converter;

    beforeEach(function() {
      converter = new Markdown.Converter();
    });

    it("should default to use 'all' extensions", function() {
      var extra = Markdown.Extra.init(converter);
      spyOn(extra, "all").andCallThrough();
      converter.makeHtml(markdown);
      expect(extra.all).toHaveBeenCalled();
    });

    it("should use 'all' extensions if specified", function() {
      var extra = Markdown.Extra.init(converter, {extensions: "all"});
      spyOn(extra, "all").andCallThrough();
      converter.makeHtml(markdown);
      expect(extra.all).toHaveBeenCalled();
    });

    it("should use 'tables' extension if specified", function() {
      var extra = Markdown.Extra.init(converter, {extensions: "tables"});
      spyOn(extra, "tables").andCallThrough();
      spyOn(extra, "fencedCodeBlocks").andCallThrough();
      converter.makeHtml(markdown);
      expect(extra.tables).toHaveBeenCalled();
      expect(extra.fencedCodeBlocks).wasNotCalled();
    });

    it("should use 'fencedCodeBlocks' extension if specified", function() {
      var extra = Markdown.Extra.init(converter, {extensions: "fenced_code_gfm"});
      spyOn(extra, "tables").andCallThrough();
      spyOn(extra, "fencedCodeBlocks").andCallThrough();
      converter.makeHtml(markdown);
      expect(extra.fencedCodeBlocks).toHaveBeenCalled();
      expect(extra.tables).wasNotCalled();
    });

    it("should apply table class if specified", function() {
      Markdown.Extra.init(converter, {table_class: "table-striped"});
      var html = converter.makeHtml(table);
      expect(html).toMatch(/<table class="table-striped">/);
    });

    it("should format code for highlight.js if specified", function() {
      Markdown.Extra.init(converter, {highlighter: "highlight"});
      var html = converter.makeHtml(codeBlock);
      expect(html).toMatch(/<pre><code class="language-foolang">/);
    });

    it("should format code for prettify if specified", function() {
      Markdown.Extra.init(converter, {highlighter: "prettify"});
      var html = converter.makeHtml(codeBlock);
      expect(html).toMatch(/<pre class="prettyprint"><code class="language-foolang">/);
    });

    it("should use sanitizing converter by default for markdown inside tables", function() {
      Markdown.Extra.init(converter);
      var html = converter.makeHtml(tableComplex);
      expect(html).not.toMatch(/<script>/);
    });

    it("should use sanitizing converter if specified for markdown inside tables", function() {
      Markdown.Extra.init(converter, {sanitize: true});
      var html = converter.makeHtml(tableComplex);
      expect(html).not.toMatch(/<script>/);
    });

    it("should use regular converter if specified for markdown inside tables", function() {
      Markdown.Extra.init(converter, {sanitize: false});
      var html = converter.makeHtml(tableComplex);
      expect(html).toMatch(/<script>/);
    });
  });

  describe("when using the sanitizing converter", function() {
    var sconv;

    describe("with fenced code blocks", function() {
      beforeEach(function() {
        sconv = Markdown.getSanitizingConverter();
        Markdown.Extra.init(sconv, {extensions: "fenced_code_gfm"});
      });

      it("should convert code blocks correctly", function() {
        var html = strip(sconv.makeHtml(codeBlock));
        expect(html).toEqual(codeBlockHtml);
      });

      it("should recognize code blocks at beginning of input", function() {
        var html = sconv.makeHtml(codeBlock + '\n\n' + markdown);
        expect(html).toMatch(/<pre><code/);
      });

      it("should recognize code blocks at end of input", function() {
        var html = sconv.makeHtml(markdown + '\n\n' + codeBlock);
        expect(html).toMatch(/<pre><code/);
      });

      it("should recognize code blocks surrounded by blank lines", function() {
        var html = sconv.makeHtml('\n' + codeBlock + '\n');
        expect(html).toMatch(/<pre><code/);
      });

      it("should recognize consecutive code blocks (no blank line necessary)", function() {
        var html = sconv.makeHtml(codeBlock + '\n' + codeBlock);
        expect(html).toMatch(/<\/pre>[\s\S]*<pre>/);
      });

      it("should not recognize code blocks within block-level tags", function() {
        var html = sconv.makeHtml('<div>' + codeBlock + '</div>');
        expect(html).not.toMatch(/<pre><code/);
      });

    });

    describe("with tables", function() {
      beforeEach(function() {
        sconv = Markdown.getSanitizingConverter();
        Markdown.Extra.init(sconv, {extensions: "tables"});
      });

      it("should convert tables properly", function() {
        var html = strip(sconv.makeHtml(table));
        expect(html).toEqual(tableHtml);
      });

      it("should recognize tables at beginning of input", function() {
        var html = sconv.makeHtml(table + '\n\n' + markdown);
        expect(html).toMatch(/table/);
      });

      it("should recognize tables at end of input", function() {
        var html = sconv.makeHtml('markdown' + '\n\n' + table);
        expect(html).toMatch(/table/);
      });

      it("should have correct number of columns", function() {
        var html = sconv.makeHtml(table);
        var matches = html.match(/<\/th>/g);
        expect(matches.length).toEqual(3);
      });

      it('should have correct alignment of table data', function() {
        var html = sconv.makeHtml(table);
        var matches = html.match(/<td style="text-align:(left|right|center);">/g);
        expect(matches[0]).toMatch("left");
        expect(matches[1]).toMatch("center");
        expect(matches[2]).toMatch("right");
      });

      it('should not require initial/final pipes', function() {
        var html1 = sconv.makeHtml(table);
        var html2 = sconv.makeHtml(tableVerbose);
        expect(html1).toEqual(html2);
      });

      it('should not create tables if initial pipe is escaped', function() {
        var escapedTable = "h1 \\| h2 | h3\n:- | :-: | -:\n1 | 2 | 3";
        var escapedTable2 = "\\| h1 \\| h2 | h3\n\\| :- | :-: | -:\n\\| 1 | 2 | 3";
        var html = sconv.makeHtml(escapedTable);
        var html2 = sconv.makeHtml(escapedTable2);
        expect(html).not.toMatch(/table/);
        expect(html2).not.toMatch(/table/);
      });

      it('should search for table recursively in remainder of block if first line escaped', function() {
        var escapedTable = "foo \\| bar | baz\n :- | - | -\n h1 | h2 | h3\n :- | :-: | -:\n 1 | 2 | 3";
        var escapedTable2 = "\\| foo | bar | baz\n| :- | - | -\n| h1 | h2 | h3\n| :- | :-: | -:\n| 1 | 2 | 3";
        var html = sconv.makeHtml(escapedTable);
        var html2 = sconv.makeHtml(escapedTable2);
        expect(html).not.toMatch(/foo<\/th>/);
        expect(html).toMatch(/h1<\/th>/);
        expect(html2).not.toMatch(/foo<\/th>/);
        expect(html2).toMatch(/h1<\/th>/);
      });

      it('should convert inline data in table', function() {
        var html = sconv.makeHtml(tableComplex);
        expect(html).toMatch(/<code>/);
        expect(html).not.toMatch(/<h2>/);
      });

      it("should not recognize tables within block-level tags", function() {
        var html = sconv.makeHtml('<div>' + tableHtml + '</div>');
        expect(html).not.toMatch(/table/);
      });
    });
  });

  describe("when using multiple converters on a single page", function() {
    var conv1, conv2;

    beforeEach(function() {
      conv1 = new Markdown.Converter();
      conv2 = Markdown.getSanitizingConverter();
    });

    it("should not interfere with one another", function() {
      Markdown.Extra.init(conv1, {extensions: "tables"});
      Markdown.Extra.init(conv2, {extensions: "fenced_code_gfm"});
      var testData = table + '\n\n' + codeBlock;
      var html1 = conv1.makeHtml(testData);
      var html2 = conv2.makeHtml(testData);

      expect(html1).toMatch(/table/);
      expect(html2).not.toMatch(/table/);
      expect(html1).not.toMatch(/pre/);
      expect(html2).toMatch(/pre/);
    });
  });
});
