describe("Markdown.Extra", function() {
  // basic code block
  var codeBlock = "```foolang\nfoo=bar;\n```\n";
  // basic table
  var table = "h1 | h2 | h3\n:- | :-: | -:\n1 | 2 | 3\n";
  var tableVerbose = "| h1 | h2 | h3 |\n| :- | :-: | -: |\n| 1 | 2 | 3 |\n";
  // some basic markdown without extensions
  var markdown = "#TestHeader\n_This_ is *markdown*" +
    "\n\nCool. And a link: [google](http://www.google.com)";


  describe("when setting options", function() {
    var converter;

    beforeEach(function() {
      converter = new Markdown.Converter();
    });

    it("should default to use 'all' extensions", function() {
      var extra = Markdown.Extra.init(converter);
      spyOn(extra, "all").andCallThrough();
      converter.makeHtml('*test*');
      expect(extra.all).toHaveBeenCalled();
    });

    it("should use 'all' extensions if specified", function() {
      var extra = Markdown.Extra.init(converter, {extensions: "all"});
      spyOn(extra, "all").andCallThrough();
      converter.makeHtml('*test*');
      expect(extra.all).toHaveBeenCalled();
    });

    it("should use 'tables' extension if specified", function() {
      var extra = Markdown.Extra.init(converter, {extensions: "tables"});
      spyOn(extra, "tables").andCallThrough();
      converter.makeHtml('*test*');
      expect(extra.tables).toHaveBeenCalled();
    });

    it("should use 'fencedCodeBlocks' extension if specified", function() {
      var extra = Markdown.Extra.init(converter, {extensions: "fencedCodeBlocks"});
      spyOn(extra, "fencedCodeBlocks").andCallThrough();
      converter.makeHtml('*test*');
      expect(extra.fencedCodeBlocks).toHaveBeenCalled();
    });

    it("should apply table class if specified", function() {
      Markdown.Extra.init(converter, {tableClass: "table-striped"});
      var html = converter.makeHtml('h1 | h2 | h3\n:-: | :-: | :-:\n1 | 2 | 3\n');
      expect(html).toMatch(/^<table class="table-striped">/);
    });

    it("should format code for highlight.js if specified", function() {
      Markdown.Extra.init(converter, {highlighter: "highlight"});
      var html = converter.makeHtml(codeBlock);
      expect(html).toMatch(/^<pre><code class="language-foolang">/);
    });

    it("should format code for prettify if specified", function() {
      Markdown.Extra.init(converter, {highlighter: "prettify"});
      var html = converter.makeHtml(codeBlock);
      expect(html).toMatch(/^<pre class="prettyprint"><code class="language-foolang">/);
    });
  });

  describe("when using the sanitizing converter", function() {
    var sconv;

    describe("with fenced code blocks", function() {
      beforeEach(function() {
        sconv= Markdown.getSanitizingConverter();
        Markdown.Extra.init(sconv, {extensions: "fencedCodeBlocks"});
      });

      it("should recognize code blocks at beginning of input", function() {
        var html = sconv.makeHtml(codeBlock + '\n\n' + markdown);
        expect(html).toMatch(/<pre>/);
      });

      it("should recognize code blocks surrounded by blank lines", function() {
        var html = sconv.makeHtml('\n' + codeBlock + '\n');
        expect(html).toMatch(/<pre>/);
      });

      it("should not recognize code blocks that aren't followed by a newline", function() {
        var html = sconv.makeHtml('```foolang\nfoo=bar\n```');
        expect(html).not.toMatch(/<pre>/);
      });

      /*
      it("should not recognize code blocks within block-level tags", function() { });
      */
    });

    describe("with tables", function() {
      beforeEach(function() {
        sconv = Markdown.getSanitizingConverter();
        Markdown.Extra.init(sconv, {extensions: "tables"});
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
        var matches = html.match(/<th>/g);
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

      /*
      it("should not recognize tables within block-level tags", function() { });
      */
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
      Markdown.Extra.init(conv2, {extensions: "fencedCodeBlocks"});
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
