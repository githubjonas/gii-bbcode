/* ==========================================================
 * IMPORTANT NOTICE! A portion of this file is Copyright (c) 2008, Stone Steps Inc.
 * All rights reserved and under bsd license, see below for more information.
 * Modifications have been made to that section by the following:
 * - Added support for image [img] tags
 * ==========================================================
 * gii-bbcode.js v1.0.1
 * http://www.getskarinnovation.se/gii-bbcode
 * ==========================================================
 * Copyright 2012-2014, Getskär IT Innovation AB, Sweden
 * http://www.getskarinnovation.se
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Changelog:
 * 1.0.0    Getskär, October 30th, 2012.
 *          * Initial commit.
 * 1.0.1    Getskär, January 29th, 2014.
 *          * Added option for img tag: left, right or stretch to float left, 
 *          * right, or stretch to 100% width.
 *          
 * w        Month nnnn, 20nn.
 *          * Changed so that ...
 *
 * ========================================================== */

var bbcodeid = 1;

(function( $ ){

    $.fn.bbcode = function( options ) {

        var self = this;
        
        if ('undefined' !== typeof self.attr('data-giibbcode-has-been-rendered')) {
            return;
        }
        self.attr('data-giibbcode-has-been-rendered', true);
            

        // Create some defaults, extending them with any options that were provided
        var msettings = $.extend( {
          'iseditable'          : false,
          'startineditmode'     : false,
          'allowtoggle'         : true,
          'rows'                : 5,
          'imagefunc'           : function (targetid) { },
          'showimagebutton'     : false,
          'savefunc'            : function (id, text) { },
          'saveonclick'         : false,
          'previewfunc'         : function (head, body) { },
          'showpreviewbutton'   : false,
          'language'            : 'en',
          'texts-en'            : {
              'tooltip_preview'     : 'Preview bbCode',
              'tooltip_bold'        : 'Make selection bold',
              'tooltip_italic'      : 'Make selection italic',
              'tooltip_underlined'  : 'Make selection underlined',
              'tooltip_addimage'    : 'Add image',
              'tooltip_edit'        : 'Edit text',
              'tooltip_save'        : 'Save changes',
              'tooltip_fold'        : 'Commit changes',
              'previewhead'         : 'Preview',
              'placeholder'         : 'Enter text...',

              'buttontext_image'    : "<span class='glyphicon glyphicon-picture'></span>",
              'buttontext_preview'  : "<span class='glyphicon glyphicon-search'></span>",
              'buttontext_save'     : "<span class='glyphicon glyphicon-ok-sign'></span>",
              'buttontext_fold'     : "<span class='glyphicon glyphicon-ok-sign'></span>",
              'buttontext_edit'     : "<span class='glyphicon glyphicon-edit'></span>",
              'buttontext_b'        : "<span style='font-weight: 900;'>B</span>",
              'buttontext_i'        : "<span style='font-style: italic;'>I</span>",
              'buttontext_u'        : "<span style='text-decoration: underline;'>U</span>"
          },
          'texts-se'                : {
              'tooltip_preview'     : 'F&ouml;rhandsgranska bbCode',
              'tooltip_bold'        : 'G&ouml;r markerad text fetstil',
              'tooltip_italic'      : 'G&ouml;r markerad text kursiv',
              'tooltip_underlined'  : 'G&ouml;r markerad text understruken',
              'tooltip_addimage'    : 'L&auml;gg till bild',
              'tooltip_edit'        : 'Editera denna text',
              'tooltip_save'        : 'Spara &auml;ndringar',
              'tooltip_fold'        : 'Acceptera &auml;ndringar',
              'previewhead'         : 'F&ouml;rhandsgranskning',
              'placeholder'         : 'Ange text...',
              'buttontext_b'        : "<span style='font-weight: 900;'>F</span>",
              'buttontext_i'        : "<span style='font-style: italic;'>K</span>"
          }
        }, options);

        function bbCodeWrapSelection(elm, type) {
                var start = $("#" + elm)[0].selectionStart;
                var end = $("#" + elm)[0].selectionEnd;
                var text = $("#" + elm).val();

                if (end - start > 0) {
                    text = text.substring(0, start) + "[" + type + "]" + text.substring(start, end) + "[/" + type + "]" + text.substring(end, text.length);
                    $("#" + elm).val(text);
                    $("#" + elm)[0].selectionEnd = end + (type.length * 2) + 5;
                }
        }

        var html = $.trim(self.html());

        var settings = jQuery.extend({}, msettings);

        // Override default settings by data-* attributes
        $.each(settings, function(key, val) {
            if (self.attr("data-" + key)) {
                var newval = self.attr("data-" + key);
                if (newval.toLowerCase() == 'true') settings[key] = true;
                if (newval.toLowerCase() == 'false') settings[key] = false;
                else settings[key] = newval;
            }
        });

        var texts = settings['texts-' + settings.language];

        // check if fallback to english is needed
        $.each(settings['texts-en'], function(key, val) {
            if (typeof texts[key] == 'undefined') texts[key] = val;
        });

        if (settings.iseditable) {
            
            var id = "giibbcodeid" + bbcodeid++;
            var saveid = id;

            if (typeof self.attr("data-id") != 'undefined') {
                id = self.attr("data-id");
            }
            if (typeof self.attr("data-save-id") != 'undefined') {
                saveid = self.attr("data-save-id");
            }


            var preview = "";
            var image = "";
            var save = "";
            var edit = "";


            if (settings.showimagebutton) {
                image = "<span rel='tooltip' title='" + texts.tooltip_addimage + "' class='btn btn-small gii-bbcode-add-image' href='#'>" + texts.buttontext_image + "</span>\n";
            }
            if (settings.showpreviewbutton) {
                preview = "<span rel='tooltip' title='" + texts.tooltip_preview + "' class='btn btn-small gii-bbcode-preview' href='#'>" + texts.buttontext_preview + "</span>\n";
            }

            if (settings.allowtoggle) {
                if (settings.saveonclick) {
                    save = "<span rel='tooltip' title='" + texts.tooltip_save + "' class='btn btn-small pull-right gii-bbcode-save-button'>" + texts.buttontext_save + "</span>\n";
                } else {
                    save = "<span rel='tooltip' title='" + texts.tooltip_fold + "' class='btn btn-small pull-right gii-bbcode-save-button'>" + texts.buttontext_fold + "</span>\n";
                }
                edit = "<span rel='tooltip' title='" + texts.tooltip_edit + "' class='btn btn-small pull-right gii-bbcode-edit-button'>" + texts.buttontext_edit + "</span>\n";
            }

            self.html(
            "<div class='gii-bbcode-editable' data-bbcode-content-id='" + id + "'>\n" +
            "  <div class='gii-bbcode-editarea'>\n" +
            "    " + save +
            "    <div class='btn-toolbar'>\n" +
            "      <div class='btn-group'>\n" +
            "        " + preview +
            "        <span rel='tooltip' title='" + texts.tooltip_bold + "' class='btn btn-small gii-bbcode-bold' href='#'>" + texts.buttontext_b + "</span>\n" +
            "        <span rel='tooltip' title='" + texts.tooltip_italic + "' class='btn btn-small gii-bbcode-italic' href='#'>" + texts.buttontext_i + "</span>\n" +
            "        <span rel='tooltip' title='" + texts.tooltip_underlined + "' class='btn btn-small gii-bbcode-underlined' href='#'>" + texts.buttontext_u + "</span>\n" +
            "        " + image +
            "      </div>\n" +
            "    </div>" +
            "    <textarea class='gii-bbcode-textarea form-control' id='" + id + "' name='" + id + "' rows='" + settings.rows + "' placeholder='" + texts.placeholder + "'>"+ html +"</textarea>\n" +
            "  </div>" +
            "  <div class='gii-bbcode-viewarea'>\n" +
            "    " + edit +
            "    <div id='view" + id + "'>" + parseBBCode(html) + "</div>" +
            "  </div>\n" +
            "</div>\n");

            if (settings.startineditmode) {
                self.find(".gii-bbcode-editarea").show();
                self.find(".gii-bbcode-viewarea").hide();
            } else {
                self.find(".gii-bbcode-editarea").hide();
                self.find(".gii-bbcode-viewarea").show();
            }

            self.find(".gii-bbcode-bold").click(function() {bbCodeWrapSelection($(this).parents(".gii-bbcode-editable").attr("data-bbcode-content-id"), "b");});
            self.find(".gii-bbcode-italic").click(function() {bbCodeWrapSelection($(this).parents(".gii-bbcode-editable").attr("data-bbcode-content-id"), "i");});
            self.find(".gii-bbcode-underlined").click(function() {bbCodeWrapSelection($(this).parents(".gii-bbcode-editable").attr("data-bbcode-content-id"), "u");});
            self.find(".gii-bbcode-edit-button").click(function() {
                var thisbbcode = $(this).parents(".gii-bbcode-editable");
                thisbbcode.find(".gii-bbcode-editarea").show();
                thisbbcode.find(".gii-bbcode-viewarea").hide();
            });
            self.find(".gii-bbcode-add-image").click(function() {
                var thisbbcode = $(this).parents(".gii-bbcode-editable");
                var textid = thisbbcode.attr("data-bbcode-content-id");
                settings.imagefunc(textid);
            });
            self.find(".gii-bbcode-save-button").click(function() {
                var thisbbcode = $(this).parents(".gii-bbcode-editable");
                thisbbcode.find(".gii-bbcode-editarea").hide();
                thisbbcode.find(".gii-bbcode-viewarea").show();
                var text = $("#" + thisbbcode.attr("data-bbcode-content-id")).val();
                $("#view" + id).html(parseBBCode(text));

                if (jQuery.isFunction(settings.savefunc)) {
                    settings.savefunc(saveid, text);
                }
            });
            self.find(".gii-bbcode-preview").click(function() {
                var thisbbcode = $(this).parents(".gii-bbcode-editable");
                var text = parseBBCode($("#" + thisbbcode.attr("data-bbcode-content-id")).val());
                settings.previewfunc(texts.previewhead, text);
            });

        } else {

            self.html(parseBBCode(html));

        }

        // Keep elements with class "gii-bbcode-hidden" hidden, show all others
        self.not(".gii-bbcode-hidden").each(function() {
            self.show();
        });
    };

    /*
     * THIS PORTIONS OF THE FILE IS UNDER A SEPARATE COPYRIGHT LICENSE
     */

    // -----------------------------------------------------------------------
    // Copyright (c) 2008, Stone Steps Inc.
    // All rights reserved
    // http://www.stonesteps.ca/legal/bsd-license/
    //
    // This is a BBCode parser written in JavaScript. The parser is intended
    // to demonstrate how to parse text containing BBCode tags in one pass
    // using regular expressions.
    //
    // The parser may be used as a backend component in ASP or in the browser,
    // after the text containing BBCode tags has been served to the client.
    //
    // Following BBCode expressions are recognized:
    //
    // [b]bold[/b]
    // [i]italic[/i]
    // [u]underlined[/u]
    // [s]strike-through[/s]
    // [samp]sample[/samp]
    //
    // [color=red]red[/color]
    // [color=#FF0000]red[/color]
    // [size=1.2]1.2em[/size]
    //
    // [url]http://blogs.stonesteps.ca/showpost.asp?pid=33[/url]
    // [url=http://blogs.stonesteps.ca/showpost.asp?pid=33][b]BBCode[/b] Parser[/url]
    //
    // [q=http://blogs.stonesteps.ca/showpost.asp?pid=33]inline quote[/q]
    // [q]inline quote[/q]
    // [blockquote=http://blogs.stonesteps.ca/showpost.asp?pid=33]block quote[/blockquote]
    // [blockquote]block quote[/blockquote]
    //
    // [pre]formatted
    //     text[/pre]
    // [code]if(a == b)
    //   print("done");[/code]
    //
    // text containing [noparse] [brackets][/noparse]
    //
    // -----------------------------------------------------------------------
    var opentags;           // open tag stack
    var crlf2br = true;     // convert CRLF to <br>?
    var noparse = false;    // ignore BBCode tags?
    var urlstart = -1;      // beginning of the URL if zero or greater (ignored if -1)

    // aceptable BBcode tags, optionally prefixed with a slash
    var tagname_re = /^\/?(?:b|i|u|pre|samp|code|colou?r|size|noparse|url|img|s|q|blockquote)$/;

    // color names or hex color
    var color_re = /^(:?black|silver|gray|white|maroon|red|purple|fuchsia|green|lime|olive|yellow|navy|blue|teal|aqua|#(?:[0-9a-f]{3})?[0-9a-f]{3})$/i;

    // numbers
    var number_re = /^[\\.0-9]{1,8}$/i;

    // reserved, unreserved, escaped and alpha-numeric [RFC2396]
    var uri_re = /^[-;\/\?:@&=\+\$,_\.!~\*'\(\)%0-9a-z]{1,512}$/i;

    // main regular expression: CRLF, [tag=option], [tag] or [/tag]
    var postfmt_re = /([\r\n])|(?:\[([a-z]{1,16})(?:=([^\x00-\x1F"'\(\)<>\[\]]{1,256}))?\])|(?:\[\/([a-z]{1,16})\])/ig;

    // stack frame object
    function taginfo_t(bbtag, etag)
    {
       this.bbtag = bbtag;
       this.etag = etag;
    }

    // check if it's a valid BBCode tag
    function isValidTag(str)
    {
       if(!str || !str.length)
          return false;

       return tagname_re.test(str);
    }

    //
    // m1 - CR or LF
    // m2 - the tag of the [tag=option] expression
    // m3 - the option of the [tag=option] expression
    // m4 - the end tag of the [/tag] expression
    //
    function textToHtmlCB(mstr, m1, m2, m3, m4, offset, string)
    {
       //
       // CR LF sequences
       //
       if(m1 && m1.length) {
          if(!crlf2br)
             return mstr;

          switch (m1) {
             case '\r':
                return "";
             case '\n':
                return "<br>";
          }
       }

       //
       // handle start tags
       //
       if(isValidTag(m2)) {
          // if in the noparse state, just echo the tag
          if(noparse)
             return "[" + m2 + "]";

          // ignore any tags if there's an open option-less [url] tag
          if(opentags.length && opentags[opentags.length-1].bbtag == "url" && urlstart >= 0)
             return "[" + m2 + "]";

          switch (m2) {
             case "code":
                opentags.push(new taginfo_t(m2, "</code></pre>"));
                crlf2br = false;
                return "<pre><code>";

             case "pre":
                opentags.push(new taginfo_t(m2, "</pre>"));
                crlf2br = false;
                return "<pre>";

             case "color":
             case "colour":
                if(!m3 || !color_re.test(m3))
                   m3 = "inherit";
                opentags.push(new taginfo_t(m2, "</span>"));
                return "<span style=\"color: " + m3 + "\">";

             case "size":
                if(!m3 || !number_re.test(m3))
                   m3 = "1";
                opentags.push(new taginfo_t(m2, "</span>"));
                return "<span style=\"font-size: " + Math.min(Math.max(m3, 0.7), 3) + "em\">";

             case "s":
                opentags.push(new taginfo_t(m2, "</span>"));
                return "<span style=\"text-decoration: line-through\">";

             case "noparse":
                noparse = true;
                return "";

             case "url":
                opentags.push(new taginfo_t(m2, "</a>"));

                // check if there's a valid option
                if(m3 && uri_re.test(m3)) {
                   // if there is, output a complete start anchor tag
                   urlstart = -1;
                   return "<a href=\"" + m3 + "\">";
                }

                // otherwise, remember the URL offset
                urlstart = mstr.length + offset;

                // and treat the text following [url] as a URL
                return "<a href=\"";

             case "img": // Added by Getskär IT Innovation AB, 2012.
                opentags.push(new taginfo_t(m2, "\">"));
                
                var style = 'style="max-width: 100%;"';
                if (m3) {
                    switch(m3) {
                        case 'left':
                            style = 'style="max-width: 100%; float: left; padding: 4px 4px 4px 0px;"';
                            break;
                        case 'right':
                            style = 'style="max-width: 100%; float: right; padding: 4px 0px 4px 4px;"';
                            break;
                        case 'stretch':
                            style = 'style="width: 100%;"';
                            break;
                    }
                }

                return "<img " + style + " src=\"";
                
             case "q":
             case "blockquote":
                opentags.push(new taginfo_t(m2, "</" + m2 + ">"));
                return m3 && m3.length && uri_re.test(m3) ? "<" + m2 + " cite=\"" + m3 + "\">" : "<" + m2 + ">";

             default:
                // [samp], [b], [i] and [u] don't need special processing
                opentags.push(new taginfo_t(m2, "</" + m2 + ">"));
                return "<" + m2 + ">";

          }
       }

       //
       // process end tags
       //
       if(isValidTag(m4)) {
          if(noparse) {
             // if it's the closing noparse tag, flip the noparse state
             if(m4 == "noparse")  {
                noparse = false;
                return "";
             }

             // otherwise just output the original text
             return "[/" + m4 + "]";
          }

          // highlight mismatched end tags
          if(!opentags.length || opentags[opentags.length-1].bbtag != m4)
             return "<span style=\"color: red\">[/" + m4 + "]</span>";

          if(m4 == "url") {
             // if there was no option, use the content of the [url] tag
             if(urlstart > 0)
                return "\">" + string.substr(urlstart, offset-urlstart) + opentags.pop().etag;

             // otherwise just close the tag
             return opentags.pop().etag;
          }
          else if(m4 == "code" || m4 == "pre")
             crlf2br = true;

          // other tags require no special processing, just output the end tag
          return opentags.pop().etag;
       }

       return mstr;
    }

    //
    // post must be HTML-encoded
    //
    function parseBBCode(post)
    {
       var result, endtags, tag;

       // convert CRLF to <br> by default
       crlf2br = true;

       // create a new array for open tags
       if(opentags == null || opentags.length)
          opentags = new Array(0);

       // run the text through main regular expression matcher
       result = post.replace(postfmt_re, textToHtmlCB);

       // reset noparse, if it was unbalanced
       if(noparse)
          noparse = false;

       // if there are any unbalanced tags, make sure to close them
       if(opentags.length) {
          endtags = new String();

          // if there's an open [url] at the top, close it
          if(opentags[opentags.length-1].bbtag == "url") {
             opentags.pop();
             endtags += "\">" + post.substr(urlstart, post.length-urlstart) + "</a>";
          }

          // close remaining open tags
          while(opentags.length)
             endtags += opentags.pop().etag;
       }

       return endtags ? result + endtags : result;
    }
    /*
     * END OF STONESTEPS CODE
     */

})( jQuery );

/*
 * Helper function to add image bbcode-urls to the bbcode edit area
 * targetId     The id of the bbcode edit area
 * imageUrl     The URL to the image to add
 */
function addImageBBCode(targetId, imageUrl) {
    var start = $(targetId)[0].selectionStart;
    var end = $(targetId)[0].selectionEnd;
    var text = $(targetId).val();

    text = text.substring(0, start) + "[img]" + imageUrl + "[/img]" + text.substring(start, text.length);

    $(targetId).val(text);
}

