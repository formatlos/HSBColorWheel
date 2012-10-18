/**
 *  @author Martin Raedlinger (mr@formatlos.de)
 */


HSBColorWheel = (function (window, $) {


    /*******************************************
     * @class HSBColorWheel
     *
     * @param {jQuery} $target container dom element
     * @param {Number} [outerRadius=200]
     * @param {Number} [innerRadius=50]
     * @param {Number} [spacing=0]
     * @param {String} [shadowMode=null] possible values null, 'inner', 'outer'
     * @constructor
     *******************************************/
    function HSBColorWheel($target, outerRadius, innerRadius, spacing, shadowMode)
    {

        /**
         * event namespace
         * @type {String}
         * @private
         */
        var _namespace = '.hsbcolorwheel';

        /**
         * the dom object
         * @type {jQuery}
         * @private
         */
        var _$el = $('<div class="hsbcolorwheel"></div>').appendTo($target);


        /**
         * body dom element
         * @type {jQuery}
         * @private
         */
        var _$body = $('body');

        /**
         * hue picker
         * @type {ColorPickerItem}
         * @private
         */
        var _hPicker = null;

        /**
         * brightness picker
         * @type {ColorPickerItem}
         * @private
         */
        var _bPicker = null;

        /**
         * saturation picker
         * @type {ColorPickerItem}
         * @private
         */
        var _sPicker = null;

        /**
         * result color display
         * @type {ColorSwatch}
         * @private
         */
        var _colorSwatch = null;


        /**
         * currently active picker (where mouse is over)
         * @type {ColorPickerItem}
         * @private
         */
        var _activePicker = null;

        /**
         * mouse is down (mouse down happened on one of the pickers)
         * @type {Boolean}
         * @private
         */
        var _mouseDown = false;

        /**
         * mouse entered dom element
         * @type {Boolean}
         * @private
         */
        var _mouseEntered = false;


        /**
         * HUE
         * @type {Number}
         * @private
         */
        var _hue = 360;

        /**
         * SATURATION
         * @type {Number}
         * @private
         */
        var _saturation = 1.0;

        /**
         * BRIGHTNESS
         * @type {Number}
         * @private
         */
        var _brightness = 1.0;


        /**
         * inner radius
         * @type {Number}
         * @private
         */
        var _innerRadius = innerRadius || 50;

        /**
         * outer radius
         * @type {Number}
         * @private
         */
        var _outerRadius = outerRadius || 200;


        /**
         * spacing between the rings
         * @type {Number}
         * @private
         */
        var _spacing = spacing || 0;

        /**
         * change callback method
         * @type {Function}
         * @private
         */
        var _onChange = undefined;


        /**
         * shadow mode
         * @type {String} null: no shadow, 'inner', 'outer'
         * @private
         */
        var _shadows = shadowMode;




        /**
         * constructor
         */
        function initialize ()
        {
            _$el.css({position:'absolute'});

            var tmpH = Math.floor(((_outerRadius - _innerRadius) - 3 * _spacing) / 3);
            var outer = _outerRadius;

            // HUE color picker
            if(!_hPicker)
            {
                _hPicker = new ColorPickerItem(_$el, 'h', outer, outer - tmpH);
                _hPicker.onChange(function(){_handlePickerChange(_hPicker)});
            }

            outer -= tmpH;
            if(_shadows == 'inner') _hPicker.addShadow(outer, 0x77000000, 0x00000000, -10);
            outer -= _spacing;
            if(_shadows == 'outer') _hPicker.addShadow(outer, 0x77000000, 0x00000000, 10);


            // SATURATION color picker
            if(!_sPicker)
            {
                _sPicker = new ColorPickerItem(_$el, 's', outer+1, outer - tmpH);
                _sPicker.onChange(function(){_handlePickerChange(_sPicker)});

            }
            outer -= tmpH;
            if(_shadows == 'inner') _hPicker.addShadow(outer, 0x77000000, 0x00000000, -10);
            outer -= _spacing;
            if(_shadows == 'outer') _hPicker.addShadow(outer, 0x77000000, 0x00000000, 10);


            // BRIGHTNESS color picker
            if(!_bPicker)
            {
                _bPicker = new ColorPickerItem(_$el, 'b', outer+1, outer - tmpH);
                _bPicker.onChange(function(){_handlePickerChange(_bPicker)});
            }

            outer -= tmpH;
            if(_shadows == 'inner') _hPicker.addShadow(outer, 0x77000000, 0x00000000, -10);
            outer -= _spacing;
            if(_shadows == 'outer') _hPicker.addShadow(outer, 0x77000000, 0x00000000, 10);

            // color display
            if(!_colorSwatch)
            {
                _colorSwatch = new ColorSwatch(_$el, outer+1);
            }

            _$body.on('mousedown' + _namespace, _handleMouseDown);
            _$body.on('mousemove' + _namespace, _handleMouseMove);
            _$body.on('mouseup' + _namespace, _handleMouseUp);

            _$el.on('mouseenter' + _namespace, _handleMouseEnter);
            _$el.on('mouseleave' + _namespace, _handleMouseLeave);

            updateControlsFromValues();
        };

        initialize();






    // public methods:


        /**
         * clean up everything
         */
        function finalize ()
        {

            _activePicker = null;

            if(_colorSwatch)
            {
                _colorSwatch.finalize();
                _colorSwatch = null;
            }

            if(_hPicker)
            {
                _hPicker.finalize();
                _hPicker = null;
            }

            if(_sPicker)
            {
                _sPicker.finalize();
                _sPicker = null;
            }

            if(_bPicker)
            {
                _bPicker.finalize();
                _bPicker = null;
            }

            if(_$el)
            {
                _$el.off(_namespace);
                _$el.remove();
                _$el = null;
            }

            if(_$body)
            {
                _$body.off(_namespace);
                _$body = null;
            }
        }

        /**
         * register on change callback
         * @param callback
         */
        function onChange(callback)
        {
            _onChange = callback;
        }

        /**
         * get the color as integer
         * @return {Number}
         */
        function getColorInt()
        {
            var rgb = ColorUtils.HSBtoRGB(_hue, _saturation, _brightness);
            return ColorUtils.RGBToHex(rgb[0], rgb[1], rgb[2]);
        }


        /**
         * get the color as RGB
         * @return {Object}
         */
        function getRGB()
        {
            var rgb = ColorUtils.HSBtoRGB(_hue, _saturation, _brightness);
            return {r:rgb[0],g:rgb[1],b:rgb[2]};
        }

        /**
         * set the color as RGB
         */
        function setRGB(rgb)
        {
            var hsb = ColorUtils.RGBtoHSB(rgb.r, rgb.g, rgb.b);
            _hue = hsb[0];
            _saturation = hsb[1];
            _brightness = hsb[2];
            updateControlsFromValues();
        }


        /**
         * get the color as HSB
         * @return {Object}
         */
        function getHSB()
        {
            return {h:_hue,s:_saturation,b:_brightness};
        }

        /**
         * set the color as HSB
         */
        function setHSB(hsb)
        {
            _hue = hsb.h;
            _saturation = hsb.s;
            _brightness = hsb.b;
            updateControlsFromValues();
        }

        /**
         * set the position
         */
        function setPosition(x, y)
        {
            _$el.css({top:y, left:x});
        }


    // private methods:

        /**
         * one of the picker wheels changed
         * @param picker
         * @private
         */
        function _handlePickerChange(picker)
        {
            // update values
            updateValuesFromControls();

            // update other pickers with color
            updateControlsColors((picker == _hPicker), (picker != _bPicker));

            // call change callback
            var hsb = {h:_hue, s:_saturation, b:_brightness};
            var rgb = {h:_hue, s:_saturation, b:_brightness};

            if(_onChange) _onChange(getHSB(), getRGB());
        }

        /**
         *
         */
        function updateControlsFromValues()
        {
            // update HUE
            _hPicker.setValue(_hue);
            _sPicker.setValue(_saturation);
            _bPicker.setValue(_brightness);
            updateControlsColors(true, true);
        }

        /**
         *
         * @param updateSat
         * @param updateBr
         */
        function updateControlsColors(updateSat, updateBr)
        {
            var rgb;
            var col;

            // update SATURATION
            if(updateSat)
            {
                rgb = ColorUtils.HSBtoRGB(_hue, 1.0, 1.0);
                col = ColorUtils.RGBToHex(rgb[0], rgb[1], rgb[2]);
                _sPicker.setColor(col);
            }

            // update BRIGHTNESS
            if(updateBr)
            {
                rgb = ColorUtils.HSBtoRGB(_hue, _saturation, 1.0);
                col = ColorUtils.RGBToHex(rgb[0], rgb[1], rgb[2]);
                _bPicker.setColor(col);
            }

            // update color swatch
            _colorSwatch.setColor(getColorInt());
        }

        function updateValuesFromControls()
        {
            _hue = _hPicker.getValue();
            _saturation = _sPicker.getValue();
            _brightness = _bPicker.getValue();
        }


        function _handleMouseDown(event)
        {
            if(!_activePicker) return;
            _mouseDown = true;
            _activePicker.mouseDown(event);
        }

        function _handleMouseMove(event)
        {
            if(!_mouseEntered) return;

            if(!_mouseDown)
            {
                var tmp = _getPicker(event.pageX, event.pageY);

                if(tmp !== _activePicker)
                {
                    if(_activePicker) _activePicker.mouseOut();
                    _activePicker = tmp;
                    if(_activePicker) _activePicker.mouseOver(event);
                }
            }

            if(_activePicker)
            {
                _activePicker.mouseMove(event);
            }
        }

        function _handleMouseUp(event)
        {
            _mouseDown = false;
            if(!_activePicker) return;
            _activePicker.mouseUp(event);

            //
            _handleMouseMove(event);
        }

        function _handleMouseEnter(event)
        {
            _mouseEntered = true;
        }

        function _handleMouseLeave(event)
        {
            _handleMouseUp(event);
            _handleMouseMove(event);
            _mouseEntered = false;
        }


        function _getPicker(pageX, pageY)
        {
            var offset = _$el.offset();
            var mouseX = pageX - offset.left;
            var mouseY = pageY - offset.top;
            var radius = Math.sqrt(Math.pow(mouseX, 2) + Math.pow(mouseY, 2));

            if(_hPicker.isOver(radius)) return _hPicker;
            else if(_sPicker.isOver(radius)) return _sPicker;
            else if(_bPicker.isOver(radius)) return _bPicker;
        }


        /**
         * PUBLIC API
         */
        this.finalize = finalize;
        this.onChange = onChange;
        this.setRGB = setRGB;
        this.getRGB = getRGB;
        this.setHSB = setHSB;
        this.getHSB = getHSB;
        this.setPosition = setPosition;
    }


    /*******************************************
     * @class ColorPickerItem
     *******************************************/
    function ColorPickerItem($target, type, outerRadius, innerRadius)
    {

        /**
         * dom element
         * @type {jQuery}
         * @private
         */
        var _$el = null;


        /**
         * arrow dom element
         * @type {jQuery}
         * @private
         */
        var _$arrow = null;

        /**
         * type
         * @type {String} h,s,b
         * @private
         */
        var _type = type || 'h';

        /**
         * current rotation
         * @type {Number}
         * @private
         */
        var _rotation = 0;

        /**
         * mouse move rotation delta
         * @type {Number}
         * @private
         */
        var _rotationDelta = 0;

        /**
         * mouse down was triggered
         * @type {Boolean}
         * @private
         */
        var _mouseDown = false;

        /**
         * change callback method
         * @type {Function}
         * @private
         */
        var _onChange = undefined;

        /**
         * the canvas container dom element
         * @type {jQuery}
         * @private
         */
        var _$canvasContainer = null;

        /**
         * the canvas dom element
         * @type {jQuery}
         * @private
         */
        var _$canvas = null;

        /**
         * drawing context
         * @type {CanvasRenderingContext2D}
         * @private
         */
        var _canvasContext = null;


        /**
         * the canvas dom element
         * @type {jQuery}
         * @private
         */
        var _$canvasColor = null;

        /**
         * drawing context
         * @type {CanvasRenderingContext2D}
         * @private
         */
        var _canvasColorContext = null;

        /**
         * the inner radius
         * @type {Number}
         * @private
         */
        var _innerRadius = innerRadius;

        /**
         * the outer radius
         * @type {Number}
         * @private
         */
        var _outerRadius = outerRadius;

        /**
         *
         * @type {Number}
         * @private
         */
        var _size = _outerRadius * 2;

        /**
         * center of the circle
         * @type {Point}
         * @private
         */
        var _center = new Point(_outerRadius, _outerRadius);


        /**
         * the color defined by hue
         * @type {Number}
         * @private
         */
        var _color = 0.0;

        function getColor()
        {
            return _color;
        }

        function setColor(p)
        {
            _color = p;
            _update();
        }

        /**
         * mix the colors on the fly
         * @type {Number}
         * @private
         */
        var _colorMixing = false;


        /**
         * the current value
         * @type {Number} H: 0.0-360.0, S/B : 0.0-1.0
         * @private
         */
        var _value = 0.0;

        function getValue()
        {
            return (_type == 'h') ? _value * 360 : _value;
        }

        function setValue(p)
        {
            // bring it down to 0.0 - 1.0
            if(_type == 'h') p /= 360;

            // set value
            _value = MathUtils.clamp(p, 0.0, 1.0);

            //
            var factor = 360;
            if(_type == 's' || _type == 'b') factor = 180;

            //
            setRotation((1.0-_value) * factor);
        }


        /**
         * init
         */
        function initialize ()
        {
            _$el = $('<div></div>').prependTo($target);
            _$canvasContainer = $('<div></div>').appendTo(_$el);

            //
            if(!_colorMixing && (_type == 's' || _type == 'b'))
            {
                _$canvasColor = $('<canvas width="'+_size+'" height="'+_size+'"></canvas>').appendTo(_$canvasContainer);
                _$canvasColor.css({
                    'position': 'absolute',
                    'margin-top': -_outerRadius + 'px',
                    'margin-left': -_outerRadius + 'px',
                    '-webkit-user-select': 'none'
                });
                _canvasColorContext = _$canvasColor.get(0).getContext('2d');

            }

            //
            _$canvas = $('<canvas width="'+_size+'" height="'+_size+'"></canvas>').appendTo(_$canvasContainer);
            _$canvas.css({
                'position': 'absolute',
                'margin-top': -_outerRadius + 'px',
                'margin-left': -_outerRadius + 'px',
                '-webkit-user-select': 'none'
            });
            _canvasContext = _$canvas.get(0).getContext('2d');

            //
            _$arrow = $('<div></div>').appendTo(_$el);
            _$arrow.css({
                'position': 'absolute',
                'margin-top': -_outerRadius + 'px',
                'width': '0px',
                'height': '0px',
                'opacity': '0.0',
                'border-style': 'solid',
                'border-width': '15px 3px 0 3px',
                'border-color': '#000000 transparent transparent transparent'
            });

            //
            _redraw();
            _update();

        };
        initialize();

        // public methods:

        /**
         * clean up everything
         */
        function finalize ()
        {

            _onChange = null;
            _$canvas = null;
            _$arrow = null;
            _canvasContext = null;
            _$canvasContainer = null;
            _$canvasColor = null;
            _canvasColorContext = null;


            if(_$el)
            {
                _$el.remove();
                _$el = null;
            }

        }


        function onChange(callback)
        {
            _onChange = callback;
        }


        function isOver(radius)
        {
            return (radius >= _innerRadius && radius <= _outerRadius);
        }

        function mouseDown(event)
        {
            var offset = _$el.offset();
            var mouseX = event.pageX - offset.left;
            var mouseY = event.pageY - offset.top;


            _rotationDelta = _rotation - (Math.atan2(mouseY, mouseX) * (180 / Math.PI));

            _mouseDown = true;
        }

        function mouseMove(event)
        {
            if(!_mouseDown) return;

            var offset = _$el.offset();
            var mouseX = event.pageX - offset.left;
            var mouseY = event.pageY - offset.top;

            setRotation(Math.atan2(mouseY, mouseX) * (180 / Math.PI) + _rotationDelta);
            updateValue(true);
        }

        function mouseUp(event)
        {
            if(!_mouseDown) return;
            _mouseDown = false;
        }

        function mouseOver()
        {
            _$arrow.stop().animate({
                opacity: 0.6
            }, 300 );
        }

        function mouseOut()
        {
            _$arrow.stop().animate({
                opacity: 0.0
            }, 300 );
        }


        // private methods:

        function _update()
        {
            if(_colorMixing)
            {
                _canvasContext.clearRect(0, 0, _size, _size);

                if(_type == 'h')
                {
                    GraphicsUtils.drawCircleSegmentSpectrum(_canvasContext, 180, 360+180, _outerRadius, _innerRadius, _center);
                }
                else if(_type == 's')
                {
                    GraphicsUtils.drawCircleSegmentGradient(_canvasContext, 0xffffff, _color, 0, 180, _outerRadius, _innerRadius, _center);
                    GraphicsUtils.drawCircleSegmentGradient(_canvasContext, _color, 0xffffff, 180, 360, _outerRadius, _innerRadius, _center);
                }
                else if(_type == 'b')
                {
                    GraphicsUtils.drawCircleSegmentGradient(_canvasContext, 0x000000, _color, 0, 180, _outerRadius, _innerRadius, _center);
                    GraphicsUtils.drawCircleSegmentGradient(_canvasContext, _color, 0x000000, 180, 360, _outerRadius, _innerRadius, _center);
                }
            }
            else
            {
                if(_type == 's' || _type == 'b')
                {
                    _canvasColorContext.clearRect(0, 0, _size, _size);
                    GraphicsUtils.drawCircle(_canvasColorContext, _color, _outerRadius, _innerRadius, _center);
                }

            }
        }


        function _redraw()
        {
            if(_colorMixing) return;

            _canvasContext.clearRect(0, 0, _size, _size);

            if(_type == 'h')
            {
                GraphicsUtils.drawCircleSegmentSpectrum(_canvasContext, 180, 360+180, _outerRadius, _innerRadius, _center);
            }
            else if(_type == 's')
            {
                GraphicsUtils.drawCircleGradient(_canvasContext, 0xffffff, _outerRadius, _innerRadius, _center);
            }
            else if(_type == 'b')
            {
                GraphicsUtils.drawCircleGradient(_canvasContext, 0x000000, _outerRadius, _innerRadius, _center);
            }
        }

        function addShadow(radius, col1, col2, size)
        {
            var gradient;

            gradient = _canvasContext.createRadialGradient(_center.x, _center.y, radius, _center.x, _center.y, radius + size);
            gradient.addColorStop(0, ColorUtils.uintToRGBAString(col1));
            gradient.addColorStop(1, ColorUtils.uintToRGBAString(col2));

            _canvasContext.fillStyle = gradient;
            _canvasContext.beginPath();
            _canvasContext.arc(_center.x, _center.y, radius, 0, 2*Math.PI, false);
            _canvasContext.arc(_center.x, _center.y, radius + size, 0, 2*Math.PI, true);
            _canvasContext.fill();
        }


        function setRotation(value)
        {
            _rotation = value;

            var rotationStr = 'rotate('+_rotation+'deg)';

            _$canvasContainer.css({
                '-webkit-transform': rotationStr,
                '-moz-transform': rotationStr,
                '-ms-transform': rotationStr,
                '-o-transform': rotationStr,
                'transform': rotationStr
            });
        }

        function updateValue(fireEvent)
        {
            var tmpR  = MathUtils.normalizeAngle(_rotation);

            //
            var factor;


            //
            if(_type == 's' || _type == 'b')
            {
                if(tmpR > 180) tmpR = 360 - tmpR;
                factor = 1 / 180;
            }
            else factor = 1 / 360;


            //
            var tmpValue = 1.0 - MathUtils.clamp(tmpR * factor, 0.0, 1.0);

            if(tmpValue != _value)
            {
                _value = tmpValue;
                if(fireEvent && _onChange) _onChange();
            }
        }


        this.getColor = getColor;
        this.setColor = setColor;
        this.setValue = setValue;
        this.getValue = getValue;
        this.mouseDown = mouseDown;
        this.mouseMove = mouseMove;
        this.mouseUp = mouseUp;
        this.mouseOver = mouseOver;
        this.mouseOut = mouseOut;
        this.isOver = isOver;
        this.onChange = onChange;
        this.finalize = finalize;
        this.addShadow = addShadow;

    }


    /*******************************************
     * @class ColorSwatch
     *******************************************/
    function ColorSwatch($target, radius)
    {

        // html element
        var _$el = null;
        var _context2d = null;

        /**
         * the radius
         * @type {Number}
         * @private
         */
        var _radius = radius;

        /**
         * the size
         * @type {Number}
         * @private
         */
        var _size = _radius*2;

        /**
         * the color
         * @type {Number}
         * @private
         */
        var _color = 0.0;

        function setColor(p)
        {
            _color = p;
            update();
        }

        /**
         * init
         */
        function initialize ()
        {
            _$el = $('<canvas width="'+_size+'" height="'+_size+'"></canvas>').prependTo($target);
            _$el.css({
                'position': 'absolute',
                'margin-top': -_radius + 'px',
                'margin-left': -_radius + 'px'
            });
            _context2d = _$el.get(0).getContext('2d');

        };
        initialize();


        /**
         * clean up everything
         */
        function finalize ()
        {
            _context2d = null;

            if(_$el)
            {
                _$el.remove();
                _$el = null;
            }

        }

        /**
         * update
         */
        function update()
        {
            _context2d.clearRect(0, 0, _size, _size);
            _context2d.fillStyle = ColorUtils.uintToWebString(_color);
            _context2d.beginPath();
            _context2d.arc(_radius, _radius, _radius, 0, Math.PI * 2, false);
            _context2d.closePath();
            _context2d.fill();
        }

        /**
         * API
         */
        this.setColor = setColor;
        this.finalize = finalize;
    }


    /*******************************************
     * @class ColorUtils
     *******************************************/

    var ColorUtils = (function () {

        //
        return {

            interpolateColor: function(fromColor, toColor, progress)
            {
                var q = 1 - progress;
                var fromA = (fromColor >> 24) & 0xFF;
                var fromR = (fromColor >> 16) & 0xFF;
                var fromG = (fromColor >> 8) & 0xFF;
                var fromB = fromColor & 0xFF;

                var toA = (toColor >> 24) & 0xFF;
                var toR = (toColor >> 16) & 0xFF;
                var toG = (toColor >> 8) & 0xFF;
                var toB = toColor & 0xFF;

                var resultA = fromA * q + toA * progress;
                var resultR = fromR * q + toR * progress;
                var resultG = fromG * q + toG * progress;
                var resultB = fromB * q + toB * progress;
                var resultColor = resultA << 24 | resultR << 16 | resultG << 8 | resultB;
                return resultColor;
            },

            uintToWebString: function(color, len)
            {
                len = len || 6

                var str = color.toString(16).toUpperCase();
                while(str.length < len) str = "0" + str;
                return "#" + str.toUpperCase();
            },

            uintToRGBString: function(color)
            {
                var r = (color >> 16) & 0xFF;
                var g = (color >> 8) & 0xFF;
                var b = color & 0xFF;

                return 'rgb('+r+','+g+','+b+')';
            },

            uintToRGBAString: function(color)
            {
                var a = ((color >> 24) & 0xFF)/255;
                var r = (color >> 16) & 0xFF;
                var g = (color >> 8) & 0xFF;
                var b = color & 0xFF;

                return 'rgba('+r+','+g+','+b+', '+a+')';
            },

            RGBToHex: function(r, g, b )
            {
                var hex = (r << 16 | g << 8 | b);
                return hex;
            },

            RGBtoHSB: function(r, g , b)
            {
                var max = Math.max(r, g, b);
                var min = Math.min(r, g, b);

                var hue = 0;
                var saturation = 0;
                var value = 0;


                // get Hue
                if(max == min)
                {
                    hue = 0;
                }
                else if(max == r)
                {
                    hue = (60 * (g - b) / (max - min) + 360) % 360;
                }
                else if(max == g)
                {
                    hue = (60 * (b - r) / (max - min) + 120);
                }
                else if(max == b)
                {
                    hue = (60 * (r - g) / (max - min) + 240);
                }

                // get Value
                value = max;

                // get Saturation
                if(max == 0) saturation = 0;
                else saturation = (max - min) / max;

                return [hue, saturation, value / 255];
            },

            HSBtoRGB: function(h, s, v)
            {
                var r = 0;
                var g = 0;
                var b = 0;
                var rgb = [];

                var tempS = s;
                var tempV = v;

                var hi = Math.floor(h / 60) % 6;
                var f = h / 60 - Math.floor(h / 60);
                var p = (tempV * (1 - tempS));
                var q = (tempV * (1 - f * tempS));
                var t = (tempV * (1 - (1 - f) * tempS));

                switch(hi)
                {
                    case 0:
                        r = tempV;
                        g = t;
                        b = p;
                        break;
                    case 1:
                        r = q;
                        g = tempV;
                        b = p;
                        break;
                    case 2:
                        r = p;
                        g = tempV;
                        b = t;
                        break;
                    case 3:
                        r = p;
                        g = q;
                        b = tempV;
                        break;
                    case 4:
                        r = t;
                        g = p;
                        b = tempV;
                        break;
                    case 5:
                        r = tempV;
                        g = p;
                        b = q;
                        break;
                }

                rgb = [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
                return rgb;
            }
        };
    }());


    /*******************************************
     * @class MathUtils
     *******************************************/

    var MathUtils = (function () {

        //
        return {

            DEG_TO_RAD: (Math.PI / 180),

            RAD_TO_DEG: (180 / Math.PI),

            normalizeAngle: function (angle)
            {
                angle += 3600;
                angle %= 360;
                return angle;
            },

            clamp: function(val, min, max)
            {
                return Math.max(min, Math.min(max, val));
            }
        };
    }());


    /*******************************************
     * @class GraphicsUtils
     *******************************************/

    var GraphicsUtils = (function () {

        //
        return {

            drawCircleSegment: function(gfx, startAngle, endAngle, outerRadius, innerRadius, center)
            {
                startAngle = startAngle || 0;
                endAngle = endAngle || 360;
                outerRadius = outerRadius || 100;
                innerRadius = innerRadius || 0;

                var t, i;
                var over, to;
                var step = 22.5;
                var stepDouble = step * 2;

                center = center || new Point(0, 0);

                // ensure: innerradius < outer
                if(innerRadius > outerRadius)
                {
                    t = outerRadius;
                    outerRadius = innerRadius;
                    innerRadius = t;
                }

                // ensure: start < end
                if(startAngle > endAngle)
                {
                    t = endAngle;
                    endAngle = startAngle;
                    startAngle = t;
                }

                // ensure: segment < 360
                endAngle %= 360;

                // points for lines
                var p1 = Point.polar(innerRadius, startAngle * MathUtils.DEG_TO_RAD).add(center);
                var p2 = Point.polar(outerRadius, startAngle * MathUtils.DEG_TO_RAD).add(center);
                var p3 = Point.polar(outerRadius, endAngle * MathUtils.DEG_TO_RAD).add(center);
                var p4 = Point.polar(innerRadius, endAngle * MathUtils.DEG_TO_RAD).add(center);

                // draw first line
                gfx.moveTo(p1.x, p1.y);
                gfx.lineTo(p2.x, p2.y);

                // draw outer segments over 90 degrees
                for(i = startAngle + stepDouble;i < endAngle; i += stepDouble)
                {
                    over = Point.polar(outerRadius / Math.cos(step * MathUtils.DEG_TO_RAD), (i - step) * MathUtils.DEG_TO_RAD).add(center);
                    to = Point.polar(outerRadius, i * MathUtils.DEG_TO_RAD).add(center);
                    gfx.quadraticCurveTo(over.x, over.y, to.x, to.y);
                }

                // draw last outer segment
                i = Math.max(i - stepDouble, startAngle);
                over = Point.polar(outerRadius / Math.cos((endAngle - i) * 0.5 * MathUtils.DEG_TO_RAD), (i + (endAngle - i) * 0.5) * MathUtils.DEG_TO_RAD).add(center);
                gfx.quadraticCurveTo(over.x, over.y, p3.x, p3.y);

                // draw mid line
                gfx.lineTo(p4.x, p4.y);

                if(innerRadius == 0) return;

                // draw inner segments over 90 degrees
                for(i = endAngle - stepDouble;i > startAngle; i -= stepDouble)
                {
                    over = Point.polar(innerRadius / Math.cos(step * MathUtils.DEG_TO_RAD), (i + step) * MathUtils.DEG_TO_RAD).add(center);
                    to = Point.polar(innerRadius, i * MathUtils.DEG_TO_RAD).add(center);
                    gfx.quadraticCurveTo(over.x, over.y, to.x, to.y);
                }

                // draw first last inner segment
                i = Math.min(i + step + step, endAngle);
                over = Point.polar(innerRadius / Math.cos((i - startAngle) * 0.5 * MathUtils.DEG_TO_RAD), (i - (i - startAngle) * 0.5) * MathUtils.DEG_TO_RAD).add(center);
                gfx.quadraticCurveTo(over.x, over.y, p1.x, p1.y);
            },

            drawCircleSegmentSpectrum: function(gfx, startAngle, endAngle, outerRadius, innerRadius, center)
            {
                startAngle = startAngle || 0;
                endAngle = endAngle || 360;
                outerRadius = outerRadius || 100;
                innerRadius = innerRadius || 0;

                // normalize angles
                startAngle = MathUtils.normalizeAngle(startAngle);
                endAngle = MathUtils.normalizeAngle(endAngle);
                if(endAngle <= startAngle) endAngle += 360;

                if(!center) center = new Point();

                var rgb;
                var color;

                var i = 0;
                var ipos;
                var m = endAngle - startAngle;
                var multiplier = (360 / Number(m));


                while(i < m)
                {
                    ipos = endAngle-i;

                    // calculate the RGB channels based on the angle
                    rgb = ColorUtils.HSBtoRGB(i * multiplier, 1.0, 1.0);
                    color = (rgb[0] << 16) | (rgb[1] << 8) | rgb[2];

//                    gfx.save();
                    gfx.fillStyle = ColorUtils.uintToWebString(color);
                    gfx.beginPath();

                    GraphicsUtils.drawCircleSegment(gfx, ipos-1, ipos + 1, outerRadius, innerRadius, center);

                    gfx.closePath();
                    gfx.fill();
//                    gfx.restore();

                    ++i;
                }
            },

            drawCircleSegmentGradient: function(gfx, col1, col2, startAngle, endAngle, outerRadius, innerRadius, center)
            {
                startAngle = startAngle || 0;
                endAngle = endAngle || 360;
                outerRadius = outerRadius || 100;
                innerRadius = innerRadius || 0;

                // normalize angles
                startAngle = MathUtils.normalizeAngle(startAngle);
                endAngle = MathUtils.normalizeAngle(endAngle);
                if(endAngle <= startAngle) endAngle += 360;

                if(!center) center = new Point();

                var i = 0;
                var ipos ;
                var m = endAngle - startAngle;
                var mMulti = 1 / Number(m);
                var col;


                while(i < m)
                {
                    ipos = i + startAngle;
                    col = ColorUtils.interpolateColor(col1, col2, i * mMulti)

                    gfx.save();
                    gfx.fillStyle = ColorUtils.uintToRGBString(col);
                    gfx.beginPath();
                    GraphicsUtils.drawCircleSegment(gfx, ipos-1, ipos + 1, outerRadius, innerRadius, center);
                    gfx.closePath();
                    gfx.fill();
                    gfx.restore();

                    ++i;
                }
            },

            drawCircleGradient: function(gfx, color, outerRadius, innerRadius, center)
            {
                outerRadius = outerRadius || 100;
                innerRadius = innerRadius || 0;
                if(!center) center = new Point();

                var w = outerRadius*2;
                var imgData = gfx.createImageData(w,w);
                var pos = new Point();
                var distance = new Point();
                var cur_radius, degree, factor;
                var i;
                var m = imgData.data.length;
                var r = (color >> 16) & 0xFF;
                var g = (color >> 8) & 0xFF;
                var b = color & 0xFF;


                for (i = 0;i<m;i+=4)
                {
                    distance.x = pos.x - center.x;
                    distance.y = pos.y - center.y;
                    cur_radius = distance.length();

                    if (cur_radius >= innerRadius && cur_radius <= outerRadius)
                    {
                        degree = Math.atan2(distance.y, distance.x) * MathUtils.RAD_TO_DEG;
                        degree = MathUtils.normalizeAngle(degree+90);
                        if(degree > 180) degree = 360 - degree;
                        degree /= 180.0;

                        // soften pixel that are less than a pixel away from radius
                        factor = 1.0;
                        if(cur_radius < innerRadius+1) factor =  (cur_radius-innerRadius);
                        else if(cur_radius > outerRadius-1) factor =  (outerRadius-cur_radius);

                        //
                        imgData.data[i+0]=r;
                        imgData.data[i+1]=g;
                        imgData.data[i+2]=b;
                        imgData.data[i+3]= 255 * factor * degree;



                    }

                    //
                    pos.x++;
                    if(pos.x == w)
                    {
                        pos.x = 0;
                        pos.y++;
                    }
                }
                gfx.putImageData(imgData,0,0);
            },

            drawCircle: function(gfx, color, outerRadius, innerRadius, center)
            {
                outerRadius = outerRadius || 100;
                innerRadius = innerRadius || 0;
                if(!center) center = new Point();

                var w = outerRadius*2;
                var imgData = gfx.createImageData(w,w);
                var pos = new Point();
                var distance = new Point();
                var cur_radius, factor;
                var i;
                var m = imgData.data.length;
                var r = (color >> 16) & 0xFF;
                var g = (color >> 8) & 0xFF;
                var b = color & 0xFF;


                for (i = 0;i<m;i+=4)
                {
                    distance.x = pos.x - center.x;
                    distance.y = pos.y - center.y;
                    cur_radius = distance.length();

                    if (cur_radius >= innerRadius && cur_radius <= outerRadius)
                    {
                        // soften pixel that are less than a pixel away from radius
                        factor = 1.0;
                        if(cur_radius < innerRadius+1) factor =  (cur_radius-innerRadius);
                        else if(cur_radius > outerRadius-1) factor =  (outerRadius-cur_radius);

                        //
                        imgData.data[i+0]=r;
                        imgData.data[i+1]=g;
                        imgData.data[i+2]=b;
                        imgData.data[i+3]= 255 * factor;
                    }

                    //
                    pos.x++;
                    if(pos.x == w)
                    {
                        pos.x = 0;
                        pos.y++;
                    }
                }
                gfx.putImageData(imgData,0,0);
            }

        };
    }());


    /*******************************************
     * @class Point
     *******************************************/

    function Point(x, y)
    {
        this.x = x || 0;
        this.y = y || 0;

        function add(value)
        {
            return new Point(this.x + value.x, this.y + value.y);
        }

        function length()
        {
        	return Math.sqrt(this.x * this.x + this.y * this.y);
        }

        function subtract(value) {
            return new Point(this.x - value.x, this.y - value.y);
        }

        this.length = length;
        this.subtract = subtract;
        this.add = add;
    }

    Point.polar = function(len, ang)
    {
        return new Point(len * Math.sin(ang), len * Math.cos(ang));
    }




    //
    return HSBColorWheel;

}(window, jQuery));



