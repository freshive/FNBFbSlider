// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;(function ( $, window, undefined ) {

    "use strict"; // jshint ;_;

  // undefined is used here as the undefined global variable in ECMAScript 3 is
  // mutable (ie. it can be changed by someone else). undefined isn't really being
  // passed in so we can ensure the value of it is truly undefined. In ES5, undefined
  // can no longer be modified.


  // window and document are passed through as local variables rather than globals
  // as this (slightly) quickens the resolution process and can be more efficiently
  // minified (especially when both are regularly referenced in your plugin).

  // Create the defaults once
  var pluginName = 'FNBFbSlider',
      defaults = {
        interval: 4000,
        //dataUrl: "sample.json"
        dataUrl: "//fnbsocialmedia.co.za/fnbhub/api/sliderimages?callback=?"
      };

  // The actual plugin constructor
  function FNBFbSlider( element, options ) {
    this.index = 1;
    this.visible = options.thumbvisible;
    this.thumbHeight = options.thumbheight;

    this.$element = $(element)
      .height(options.height)
      .addClass("slider");

    // jQuery has an extend method which merges the contents of two or
    // more objects, storing the result in the first object. The first object
    // is generally empty as we don't want to alter the default options for
    // future instances of the plugin
    this.options = $.extend( {}, defaults, options) ;

    this._defaults = defaults;
    this._name = pluginName;

    this.init();
  }

  FNBFbSlider.prototype.init = function () {
    // Get plugin data
    $.when(this.getData()).then($.proxy(function(data) {

      this.numImages = data.length;

      this.$element.append(this.buildGallery(data));
      this.$element.append(this.buildThumbs(data, this.options.height));

      setInterval($.proxy(function() {
        this.goToSlide(this.index - 1);
      }, this), this.options.interval);

    }, this));
  };

  FNBFbSlider.prototype.getData = function () {
    // Responsible for getting the slider data
    return $.getJSON(this.options.dataUrl);
  };

  FNBFbSlider.prototype.buildGallery = function (data) {
    var $gallery = $(document.createElement("div")).addClass("gallery"),
      index = 0;

    $.each(data, function() {
      var $link = $(document.createElement("a")).attr("href", this.Url),
        image = document.createElement("img");
      image.setAttribute("src", this.ImageUrl);
      image.setAttribute("data-index", index += 1);
      $link.append(image);
      $gallery.append($link);
    });

    return this.$gallery = $gallery;
  };

  FNBFbSlider.prototype.buildThumbs = function (data, height) {

    var $thumbs = $(document.createElement("div"))
      .height(height)
      .addClass("thumbs"),
      index = 0;

    $.each(data, function() {
      var $link = $(document.createElement("a")).attr("href", this.Url),
        image = document.createElement("img");
      image.setAttribute("data-index", index += 1);
      image.setAttribute("src", this.ThumbUrl);
      $link.append(image);
      $thumbs.append($link);
    });

    $thumbs.prepend($thumbs.find("img").slice(-this.visible).clone().addClass("cloned"));
    $thumbs.append($thumbs.find("img").slice(this.visible, this.visible + this.visible).clone().addClass("cloned"));

    return this.$thumbs = $thumbs;
  };

  FNBFbSlider.prototype.goToSlide = function (slide) {
    var dir = slide < this.index ? - 1 : 1,
      num = Math.abs(this.index - slide),
      scrollPos = 105 * dir * num;

    this.showMainImage(slide);

    this.$thumbs.stop().animate({
      scrollTop: '+=' + scrollPos
    }, 400, $.proxy(function() {

      var scrollPos;

      if(slide === 0) {

        scrollPos = (this.numImages + this.visible) * this.thumbHeight;
        this.$thumbs.scrollTop(scrollPos);
        slide = this.numImages;

      } else if ( slide > this.numImages ) {

        scrollPos = this.visible * this.thumbHeight;
        this.$thumbs.scrollTop(scrollPos);
        slide = 1;
      }

      this.index = slide;

    }, this));

    return false;
  };

  FNBFbSlider.prototype.showMainImage = function(slide) {


    if(slide === 0) {
      slide = this.numImages;
    } else if (slide > this.numImages) {
      slide = 1;
    }

    this.$gallery.find("img").fadeOut(400);
    this.$gallery.find("[data-index='" + slide + "']").fadeIn(400);
  };

  // A really lightweight plugin wrapper around the constructor,
  // preventing against multiple instantiations
  $.fn[pluginName] = function ( options ) {
    return this.each(function () {
      if (!$.data(this, 'plugin_' + pluginName)) {
        $.data(this, 'plugin_' + pluginName, new FNBFbSlider( this, options ));
      }
    });
  };

  // Load the plugin
  $(window).on('load', function () {
    $('[data-fnbFbSlider="true"]').each(function () {
      var $slider = $(this),
        data = $slider.data();
      // Instantiate a new menu
      $slider.FNBFbSlider(data);
    });
  });

}(jQuery, window));
