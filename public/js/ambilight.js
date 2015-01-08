/*
 This "patch" is needed for IE8 (and below), since JSON is not known.
 Solution is to provide an own implementation to work around this issue.
 In case of non-IE, the "real" JSON.stringify() function will be used,
 since JSON will be known.

 Information/solution from:
 http://stackoverflow.com/questions/5093582/json-is-undefined-error-in-ie-only
 */
var JSON = JSON || {};
// implement JSON.stringify serialization
JSON.stringify = JSON.stringify || function(obj) {
  var t = typeof (obj);
  if (t != "object" || obj === null) {
    // simple data type
    if (t == "string")
      obj = '"' + obj + '"';
    return String(obj);
  } else {
    // recurse array or object
    var n, v, json = [], arr = (obj && obj.constructor == Array);
    for (n in obj) {
      v = obj[n];
      t = typeof (v);
      if (t == "string")
        v = '"' + v + '"';
      else if (t == "object" && v !== null)
        v = JSON.stringify(v);
      json.push((arr ? "" : '"' + n + '":') + String(v));
    }
    return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
  }
};

/*********************************************************************************/
var rgbEnum = {
  "R" : 0
  ,   "G" : 1
  ,   "B" : 2
}

var rgbList = new Array('r', 'g', 'b');

var dialogBoxOpen = false;

var layerLocation = "";


function getTopology() {
  topPixels    = 0;
  rightPixels  = 0;
  bottomPixels = 0;
  leftPixels   = 0;

  $.ajax({ url: '/1/ambilight/topology'
    , dataType: "jsonp"
    , async: false
    , beforeSend: function() {
    }
    , success: function(retdata) {
      $.each(retdata, function(key, value) {
        switch( key ) {
          case 'top':
            topPixels = value;
            break;

          case 'right':
            rightPixels = value;
            break;

          case 'bottom':
            bottomPixels = value;
            break;

          case 'left':
            leftPixels = value;
            break;

          default:
            break;
        }
      });
    }
    , error: function(jqXHR, textStatus, errorThrown) {
      console.dir(jqXHR);
      console.debug('Status = ' + textStatus);
      console.debug('Error  = ' + errorThrown);
      console.debug("getTopology(): Hit error fn!");
    }
    , complete: function() {
    }
  });
}


function getCached() {
  $.ajax({ url: '/1/ambilight/cached'
    , dataType: "jsonp"
    , async: false
    , beforeSend: function() {
    }
    , success: function(jsonobject) {
      $.each(jsonobject, function(layer, sideobject) {
        console.debug('Layer: ' + layer);
        layerLocation = layer;
        console.debug('layerLocation: ' + layerLocation);
        $.each(sideobject, function(side, pixelobject) {
          console.debug('Side: ' + side);
          $.each(pixelobject, function(pixel, rgbgroupobject) {
            console.debug('Pixel: ' + pixel);
            var rgbArray = new Array();
            $.each(rgbgroupobject, function(rgb, value) {
              rgbArray[(rgb=="r"?0:rgb=="g"?1:2)] = value;
            });
            $('#ambiPixel_' + side.charAt(0).toUpperCase() + side.slice(1) + '_' + pixel).css('backgroundColor'
                // $('#ambiPixel_' + side.toLowerCase() + '_' + pixel).css('backgroundColor'
                , 'rgb(' + rgbArray[0]
                + ','
                + rgbArray[1]
                + ','
                + rgbArray[2] + ')'
            );
          });
        });
      });
    }
    , error: function(jqXHR, textStatus, errorThrown) {
      console.dir(jqXHR);
      console.debug('Status = ' + textStatus);
      console.debug('Error  = ' + errorThrown);
      console.debug("getCached(): Hit error fn!");
    }
    , complete: function() {
    }
  });
}


function postCached(jsonobject) {
  //console.debug( 'postCached(): jsonobject = ' + jsonobject );
  $.ajax({ url: '/1/ambilight/cached'
        , data: JSON.stringify(jsonobject)
        //, data: jsonobject
        , dataType: 'json'
        , async: false
        , success: function(data) {
        }
        , type: 'post'
        , timeout: 5000 // max wait 5 sec
      }
  );
}


function getMode() {
  $.ajax({ url: '/1/ambilight/mode'
    , dataType: "jsonp"
    , async: false
    , beforeSend: function() {
    }
    , success: function(jsonobject) {
      console.debug('ambilight/mode: jsonobject =' + jsonobject);
      $.each(jsonobject, function(mode, currentMode) {
        console.debug('currentMode = ' + currentMode);
      });
    }
    , error: function(jqXHR, textStatus, errorThrown) {
      console.dir(jqXHR);
      console.debug('Status = ' + textStatus);
      console.debug('Error  = ' + errorThrown);
      console.debug("getMode(): Hit error fn!");
    }
    , complete: function() {
    }
  });
}


function postMode() {
  var modeObject = new Object();

  modeObject['current'] = new Object();
  modeObject['current'] = 'manual';
  console.debug('modeObject = ' + modeObject);

  // modeObject[mode] = 'current';
  // modeObject[mode][setting] = 'manual';

  // rgbObject[layerLocation][rgbList[i]] = $(obj).text();


  $.ajax({ url: '/1/ambilight/mode'
        , data: JSON.stringify(modeObject)
        //, data: jsonobject
        , dataType: 'json'
        , async: false
        , success: function(data) {
        }
        , type: 'post'
        , timeout: 5000 // max wait 5 sec
      }
  );
}


function createRegionBoxes() {
  // Create left region
  $('<div>').attr('id','ambiRegion_Left')
      .attr('class', 'eastWest ui-corner-all')
      .attr('title', 'Click to change RGB of complete LEFT side')
      .appendTo('#container')
  ;

  // Create top region
  $('<div>').attr('id','ambiRegion_Top')
      .attr('class', 'northSouth ui-corner-all')
      .attr('title', 'Click to change RGB of complete TOP side')
      .appendTo('#container')
  ;

  // Create right region
  $('<div>').attr('id','ambiRegion_Right')
      .attr('class', 'eastWest ui-corner-all')
      .attr('title', 'Click to change RGB of complete RIGHT side')
      .appendTo('#container')
  ;

  // Create bottom region
  $('<div>').attr('id','ambiRegion_Bottom')
      .attr('class', 'northSouth ui-corner-all')
      .attr('title', 'Click to change RGB of complete BOTTOM side')
      .appendTo('#container')
  ;

  // Create middle region
  $('<div>').attr('id','ambiMiddle')
      .attr('class', 'middle ui-corner-all')
      .attr('title', 'Click to change RGB of ALL sides')
      .appendTo('#container')
  ;

}


function createPixelBoxes() {
  createLeftPixelBoxes();
  createTopPixelBoxes();
  createRightPixelBoxes();
  createBottomPixelBoxes();
}


function createTopPixelBoxes() {

  if ( topPixels > 0 ) {
    var i = 0;
    var containerWidth       = $('#ambiRegion_Top').width();
    var ambiPixelMarginLeft  = parseInt( $('<div class="northSouth"><div class="ambiPixelBox"></div></div>').children().css('marginLeft') );
    var ambiPixelMarginRight = parseInt( $('<div class="northSouth"><div class="ambiPixelBox"></div></div>').children().css('marginRight') );
    var netAmbiPixelBoxWidth = Math.floor( ( ( containerWidth - ( topPixels * ( ambiPixelMarginLeft + ambiPixelMarginRight ) ) )
        / topPixels
        )
    );

    for ( i = 0; i < topPixels; i++ ) {
      $('<div>').attr('id','ambiPixel_Top_' + i)
          .attr('class', 'ambiPixelBox')
          .attr('title', 'Click to change RGB of pixel ' + ambiPixelCounter + '-' + i)
          .addClass('ui-corner-all')
          .css({'width': netAmbiPixelBoxWidth})
          .appendTo('#ambiRegion_Top')
      ;
    }

    ambiPixelCounter++;
  }
}


function createRightPixelBoxes() {

  if ( rightPixels > 0 ) {
    var i = 0;
    var containerHeight       = $('#ambiRegion_Right').height();
    var ambiPixelMarginTop    = parseInt( $('<div class="ambiPixelBox"</div>').css('marginTop') );
    var ambiPixelMarginBottom = parseInt( $('<div class="ambiPixelBox"</div>').css('marginBottom') );
    var netAmbiPixelBoxHeight = Math.floor( ( ( containerHeight - ( rightPixels * ( ambiPixelMarginBottom + ambiPixelMarginTop ) ) )
        / rightPixels
        )
    );

    for ( i = 0; i < rightPixels; i++ ) {
      $('<div>').attr('id','ambiPixel_Right_' + i)
          .attr('class', 'ambiPixelBox')
          .attr('title', 'Click to change RGB of pixel ' + ambiPixelCounter + '-' + i)
          .addClass('ui-corner-all')
          .css({'height': netAmbiPixelBoxHeight})
          .appendTo('#ambiRegion_Right')
      ;
    }

    ambiPixelCounter++;
  }
}


function createBottomPixelBoxes() {

  if ( bottomPixels > 0 ) {
    var i = 0;
    var containerWidth       = $('#ambiRegion_Bottom').width();
    var ambiPixelMarginLeft  = parseInt( $('<div class="northSouth"><div class="ambiPixelBox"></div></div>').children().css('marginLeft') );
    var ambiPixelMarginRight = parseInt( $('<div class="northSouth"><div class="ambiPixelBox"></div></div>').children().css('marginRight') );
    var netAmbiPixelBoxWidth = Math.floor( ( ( containerWidth - ( bottomPixels * ( ambiPixelMarginLeft + ambiPixelMarginRight ) ) )
        / bottomPixels
        )
    );

    for ( i = 0; i < bottomPixels; i++ ) {
      $('<div>').attr('id','ambiPixel_Bottom_' + i)
          .attr('class', 'ambiPixelBox')
          .attr('title', 'Click to change RGB of pixel ' + ambiPixelCounter + '-' + i)
          .addClass('ui-corner-all')
          .css({'width': netAmbiPixelBoxWidth})
          .prependTo('#ambiRegion_Bottom')
      ;
    }

    ambiPixelCounter++;
  }
}


function createLeftPixelBoxes() {

  if ( leftPixels > 0 ) {
    var i = 0;
    var containerHeight       = $('#ambiRegion_Left').height();
    var ambiPixelMarginTop    = parseInt( $('<div class="ambiPixelBox"</div>').css('marginTop') );
    var ambiPixelMarginBottom = parseInt( $('<div class="ambiPixelBox"</div>').css('marginBottom') );
    var netAmbiPixelBoxHeight = Math.floor( ( ( containerHeight - ( leftPixels * ( ambiPixelMarginBottom + ambiPixelMarginTop ) ) )
        / leftPixels
        )
    );

    for ( i = 0; i < leftPixels; i++ ) {
      $('<div>').attr('id','ambiPixel_Left_' + i)
          .attr('class', 'ambiPixelBox')
          .attr('title', 'Click to change RGB of pixel ' + ambiPixelCounter + '-' + i)
          .addClass('ui-corner-all')
          .css({'height': netAmbiPixelBoxHeight})
          .prependTo('#ambiRegion_Left')
      ;
    }

    ambiPixelCounter++;
  }
}


function createTopology() {
  getTopology();
  createRegionBoxes();
  createPixelBoxes();
}


function retrieveCachedValues() {
  getCached();
}


function retrieveMode() {
  getMode();
}


function createRgbDialogueBox(object) {
  var dialogOpts = {
    resizable: false,
    draggable: false,
    show: 'clip',
    hide: 'clip',
    width: 420
  };

  var underOne = $(object).attr('id').indexOf('_');
  var underTwo = $(object).attr('id').lastIndexOf('_');

  $('<div>').attr('id','myDialog')
      .attr('title', 'Change RGB values for pixel: '
      + $(object).attr('id').substring(underOne + 1, underTwo)
      + ' - '
      + $(object).attr('id').substring(underTwo + 1 )
  )
      .addClass('ui-corner-all')
      .appendTo('#container')
  ;

  $("#myDialog").dialog(dialogOpts);
  dialogBoxOpen = true;
  $('.northSouth').css('cursor', 'wait');
  $('.eastWest').css('cursor', 'wait');
  $('.ambiPixelBox').css('cursor', 'wait');

  $('#myDialog').bind('dialogclose', function() {
    dialogBoxOpen = false;
    $('.northSouth').css('cursor', 'se-resize');
    $('.eastWest').css('cursor', 'se-resize');
    $('.ambiPixelBox').css('cursor', 'ne-resize');
    $(this).remove();
  });
}


function updateUiAndJson(object) {
  var attrString = $(object).attr('id'); //e.g. 'ambiPixel_Top_0', 'ambiRegion_Left'
  console.debug('id = ' + attrString);

  // Search for part before first underscore, to know if it's pixel (ambiPixel),
  // region (ambiRegion) or overall (ambiAll) based.

  // var tempString = attrString.split("_", 1);
  // Then use "switch(tempString[0]) {"
  // Other possibility to get the same reult: use regex in the replace() function of the String class:
  // var tempString = attrString.replace(/_.*/,'');

  switch(attrString.replace(/_.*/,'')) {
    case 'ambiPixel':
      console.debug('ambiPixel detected as first part of id');
      handlePixel(attrString);
      break;

    case 'ambiRegion':
      console.debug('ambiRegion detected as first part of id');
      handleRegion(attrString);
      break;

    case 'ambiMiddle':
      console.debug('ambiMiddle detected as first part of id');
      handleMiddle(attrString);
      break;

    default:
      console.debug('Nothing found... :-(');
      break;
  }
}


function handlePixel(attrString) {
  var underOne = attrString.indexOf('_');
  var underTwo = attrString.lastIndexOf('_');

  var sideString  = attrString.substring(underOne + 1, underTwo).toLowerCase(); //e.g. 'Top'
  var pixelNumber = attrString.substring(underTwo + 1); //e.g. '0'

  var rgbObject = new Object();

  rgbObject[layerLocation] = new Object();
  rgbObject[layerLocation][sideString] = new Object();
  rgbObject[layerLocation][sideString][pixelNumber] = new Object();

  $.each($('.tip'), function( i, obj ) {
    rgbObject[layerLocation][sideString][pixelNumber][rgbList[i]] = $(obj).text();
  });

  var rgbResult = rgbObject[layerLocation][sideString][pixelNumber];
  $('#' + attrString).css('backgroundColor', 'rgb(' + rgbResult.r + ',' + rgbResult.g + ',' + rgbResult.b + ')');

  postCached(rgbObject);
}


function handleRegion(attrString) {
  var underOne = attrString.indexOf('_');
  var sideString  = attrString.substring(underOne + 1).toLowerCase(); //e.g. 'top'

  var rgbObject = new Object();

  rgbObject[layerLocation] = new Object();
  rgbObject[layerLocation][sideString] = new Object();

  $.each($('.tip'), function( i, obj ) {
    rgbObject[layerLocation][sideString][rgbList[i]] = $(obj).text();
  });

  var rgbResult = rgbObject[layerLocation][sideString];
  var pixelName = attrString.replace(/Region/,'Pixel');

  for ( i = 0; i < eval(sideString + 'Pixels'); i++ ) {
    $('#' + pixelName + '_' + i ).css('backgroundColor'
        ,'rgb(' + rgbResult.r + ',' + rgbResult.g + ',' + rgbResult.b + ')'
    );
  }

  postCached(rgbObject);
}


function handleMiddle(attrString) {
  var rgbObject = new Object();

  rgbObject[layerLocation] = new Object();

  $.each($('.tip'), function( i, obj ) {
    rgbObject[layerLocation][rgbList[i]] = $(obj).text();
  });

  var rgbResult = rgbObject[layerLocation];
  var pixelName = attrString.replace(/Middle/,'Pixel');

  // Change left side
  for ( i = 0; i < leftPixels; i++ ) {
    $('#' + pixelName + '_Left_' + i ).css('backgroundColor'
        ,'rgb(' + rgbResult.r + ',' + rgbResult.g + ',' + rgbResult.b + ')'
    );
  }

  // Change top side
  for ( i = 0; i < topPixels; i++ ) {
    $('#' + pixelName + '_Top_' + i ).css('backgroundColor'
        ,'rgb(' + rgbResult.r + ',' + rgbResult.g + ',' + rgbResult.b + ')'
    );
  }

  // Change right side
  for ( i = 0; i < rightPixels; i++ ) {
    $('#' + pixelName + '_Right_' + i ).css('backgroundColor'
        ,'rgb(' + rgbResult.r + ',' + rgbResult.g + ',' + rgbResult.b + ')'
    );
  }

  // Change bottom side
  for ( i = 0; i < bottomPixels; i++ ) {
    $('#' + pixelName + '_Bottom_' + i ).css('backgroundColor'
        ,'rgb(' + rgbResult.r + ',' + rgbResult.g + ',' + rgbResult.b + ')'
    );
  }

  postCached(rgbObject);
}


function createSlider(object, colour, rgbValue) {
  var sliderId;
  var sliderChar;
  var sliderCharColour;

  var sliderOpts = {
    min: 0,
    max: 255,
    range: "min",
    animate: true,
    start: function(e,ui){
      updateRgbTip(this,ui.value);
      $(this).find(".tip").fadeIn('fast');
    },

    change: function(e, ui) {
    },
    slide: function(e,ui){
      updateUiAndJson(object);
      updateRgbTip(this,ui.value);
    },
    stop: function(e, ui) {
      currValue = parseInt($(this).slider("value"));
      currId = $(this).attr('id');
      $('#' + $(this).next().attr('id')).val(currValue);

      updateUiAndJson(object);
      updateRgbTip(this,ui.value);
    }
  };

  switch (colour) {
    case rgbEnum.R:
      sliderId = 'myRedSlider';
      sliderChar = 'R';
      sliderCharColour = 'red';
      break;

    case rgbEnum.G:
      sliderId = 'myGreenSlider';
      sliderChar = 'G';
      sliderCharColour = 'green';
      break;

    case rgbEnum.B:
      sliderId = 'myBlueSlider';
      sliderChar = 'B';
      sliderCharColour = 'blue';
      break;

    default:
      break;
  }

  var sliderDiv = $('<div>')
          .attr('class', 'sliderLine')
          .append($('<div>')
              .attr('class', 'character')
              .css({'fontSize': '24px','fontWeight': '900', 'color': sliderCharColour} )
              .text(sliderChar)
      )
          .append($('<div>')
              .attr('id', sliderId)
              .attr('class', 'rgbSlider')
              .css('borderColor', sliderCharColour)
      )
          .append($('<input>')
              .attr('id', 'sliderValueTextBox' + sliderChar)
              .attr('class', 'sliderValueTextBox')
              .attr('type', 'text')
              .attr('readonly', 'readonly')
              .attr('value', '0')
              .css('borderColor', sliderCharColour)
              .css('color', sliderCharColour)
              .css('fontWeight', 'bold')
      )
      ;

  sliderDiv.appendTo('#myDialog');

  $('<div>').attr('class', 'ui-widget-header ui-corner-all tip')
      .appendTo('#' + sliderId)
  ;

  // $('.tip').hide();

  $('#' + sliderId).slider(sliderOpts);
  $('#' + sliderId).slider("option", "value", rgbValue );
  $('#sliderValueTextBox' + sliderChar).val(rgbValue);
  // $('.ui-slider-handle').css('borderColor', sliderCharColour);
  updateRgbTip($('#' + sliderId),rgbValue);

}


/* This is about catching clicks on pixels... */
function catchPixelClicks() {
  $('.ambiPixelBox').click( function() {
    if ( !dialogBoxOpen ) {
      console.debug('catchPixelClicks ' + $(this).attr('id'));
      var rgbParts = convertRgb($(this).attr('id'));
      createRgbDialogueBox(this);
      createSlider(this, rgbEnum.R, rgbParts[rgbEnum.R]);
      createSlider(this, rgbEnum.G, rgbParts[rgbEnum.G]);
      createSlider(this, rgbEnum.B, rgbParts[rgbEnum.B]);
    }
    return false;
  });
}

function convertRgb( string ) {
  var rgbString = $('#' + string).css('backgroundColor');
  /* Example: "rgb(10, 220, 25)" */

  var parts = rgbString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  /* Parts are now: ["rgb(140, 250, 10)", "140", "250", "10"] */

  /* Get "really" rid of first element, so it becomes: ["140", "250", "10"] instead...*/
  parts.splice(0,1);

  console.debug(parts);

  return parts;
}


function updateRgbTip(object,value) {
  var mywidth = $(object).width();
  var mypos = $(object).slider('value');
  // console.debug(mypos);
  $(object).find('.tip').css('left', mypos).text(value);
}



/* This is about catching clicks on regions... */
function catchRegionClicks() {
  $('.northSouth').click( function() {
    console.debug('clicked northSouth: ' + dialogBoxOpen);

    if ( !dialogBoxOpen ) {
      console.debug('dialogBox was not open, attribute is: ' + $(this).attr('id'));
      var pixelName;

      switch($(this).attr('id')) {
        case 'ambiRegion_Top':
          pixelName = 'ambiPixel_Top_0';
          break;

        case 'ambiRegion_Bottom':
          pixelName = 'ambiPixel_Bottom_0';
          break;

        default:
          console.error('Impossible side chosen...');
          break;
      }
      console.debug('pixelName: ' + pixelName);

      var rgbParts = convertRgb(pixelName);

      createRgbDialogueBox(this);
      createSlider(this, rgbEnum.R, rgbParts[rgbEnum.R]);
      createSlider(this, rgbEnum.G, rgbParts[rgbEnum.G]);
      createSlider(this, rgbEnum.B, rgbParts[rgbEnum.B]);
    }
    return false;
  });

  $('.eastWest').click( function() {
    console.debug('clicked eastWest: ' + dialogBoxOpen);

    if ( !dialogBoxOpen ) {
      console.debug('dialogBox was not open, attribute is: ' + $(this).attr('id'));
      var pixelName;

      switch($(this).attr('id')) {
        case 'ambiRegion_Left':
          pixelName = 'ambiPixel_Left_0';
          break;

        case 'ambiRegion_Right':
          pixelName = 'ambiPixel_Right_0';
          break;

        default:
          console.error('Impossible side chosen...');
          break;
      }
      console.debug('pixelName: ' + pixelName);

      var rgbParts = convertRgb(pixelName);

      createRgbDialogueBox(this);
      createSlider(this, rgbEnum.R, rgbParts[rgbEnum.R]);
      createSlider(this, rgbEnum.G, rgbParts[rgbEnum.G]);
      createSlider(this, rgbEnum.B, rgbParts[rgbEnum.B]);
    }
    return false;
  });

  $('.middle').click( function() {
    console.debug('clicked middle: ' + dialogBoxOpen);

    if ( !dialogBoxOpen ) {
      console.debug('dialogBox was not open, attribute is: ' + $(this).attr('id'));
      var pixelName = 'ambiPixel_Left_0';

      var rgbParts = convertRgb(pixelName);

      createRgbDialogueBox(this);
      createSlider(this, rgbEnum.R, rgbParts[rgbEnum.R]);
      createSlider(this, rgbEnum.G, rgbParts[rgbEnum.G]);
      createSlider(this, rgbEnum.B, rgbParts[rgbEnum.B]);
    }
    return false;
  });
}


// function simpleTooltip(target_items, name) {
// $(target_items).each(function(i) {
// $("body").append( "<div class='ui-corner-all " + name + "' id='" + name + i
// + "'><p>" + $(this).attr('title') + "</p></div>"
// );
// var my_tooltip = $("#"+name+i);

// if($(this).attr("title") != "") { // checks if there is a title
// $(this).removeAttr("title")
// .mouseover(function() {my_tooltip.css({opacity:0.8, display:"none"}).fadeIn(200);})
// .mousemove(function(kmouse) {my_tooltip.css({left:kmouse.pageX+5, top:kmouse.pageY+5});})
// .mouseout(function() {my_tooltip.fadeOut(200);});
// }
// });
// }


// function createTooltips() {
// simpleTooltip('.ambiPixelBox','tooltip');
// simpleTooltip('.northSouth','tooltip');
// simpleTooltip('.eastWest','tooltip');
// }

/* main function (= $(document).ready()) */
$(function() {
  ambiPixelCounter = 0;
  createTopology();
  retrieveCachedValues();
  retrieveMode();
  postMode();
  catchPixelClicks();
  catchRegionClicks();
  // createTooltips();
});