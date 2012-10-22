/**
 *  @author Martin Raedlinger (mr@formatlos.de)
 */


DemoApp = (function (window, $) {


    /*******************************************
     * @class DemoApp
     *******************************************/
    function DemoApp()
    {
        var _$controls = null;
        var _$container = null;
        var _inputRGB = null;
        var _inputHSB = null;
        var _sliderInner = null;
        var _sliderOuter = null;
        var _sliderSpacing = null;
        var _radioNone = null;
        var _radioInner = null;
        var _radioOuter = null;
        var _colorpicker = null;


        /**
         * constructor
         */
        function initialize ()
        {
            var startInner = 50;
            var startOuter = 190;
            var startSpacing = 0;


            //
            _$controls = $('<div id="controls"></div>').appendTo($('body'));
            _$container = $('<div id="container"></div>').appendTo($('body'));

            // init controls
            var controls = _$controls.get(0);

            // colors
//            new mc.Label(controls, 10, 10, "Color");
            $('<span class="label">Color</span>').css({left:'10px', top:'10px'}).appendTo(_$controls);
            new mc.Label(controls, 10, 32, "RGB");
            _inputRGB = new mc.InputText(controls, 40, 30, '', _inputRgbChanged);

            new mc.Label(controls, 10, 62, "HSB");
            _inputHSB = new mc.InputText(controls, 40, 60, '', _inputHsbChanged);

            // settings
            $('<span class="label">Settings</span>').css({left:'200px', top:'10px'}).appendTo(_$controls);
            new mc.Label(controls, 200, 32, "inner radius");
            _sliderInner = new mc.HSlider(controls, 260, 34, _sliderRadiusChanged);
            _sliderInner.setMinimum(25).setMaximum(60).setValue(startInner);
            _sliderInner.bindLabel(new mc.Label(controls, 380, 32), 0);

            new mc.Label(controls, 200, 62, "outer radius");
            _sliderOuter = new mc.HSlider(controls, 260, 64, _sliderRadiusChanged);
            _sliderOuter.setMinimum(70).setMaximum(200).setValue(startOuter);
            _sliderOuter.bindLabel(new mc.Label(controls, 380, 62), 0);

            new mc.Label(controls, 200, 92, "spacing");
            _sliderSpacing = new mc.HSlider(controls, 260, 94, _sliderSpacingChanged);
            _sliderSpacing.setMinimum(0).setMaximum(20).setValue(startSpacing);
            _sliderSpacing.bindLabel(new mc.Label(controls, 380, 92), 0);

            //
            $('<span class="label">Shadows</span>').css({left:'420px', top:'10px'}).appendTo(_$controls);
            _radioInner = new mc.RadioButton(controls, 420, 32, "inner", true, _shadowChange);
            _radioOuter = new mc.RadioButton(controls, 420, 62, "outer", false, _shadowChange);
            _radioNone = new mc.RadioButton(controls, 420, 92, "none", false, _shadowChange);


            $('<span class="label">Info</span>').css({left:'600px', top:'10px'}).appendTo(_$controls);
            $('<span class="label">get more info about the project and <br>the source code at <a href="https://github.com/formatlos/HSBColorWheel">github<a></span>')
                .css({left:'600px', top:'32px', 'font-weight':'normal'}).appendTo(_$controls);



            // init colorpicker
            _colorpicker = new HSBColorWheel(_$container, startOuter, startInner, startSpacing, 'inner');
            _colorpicker.onChange(_colorPickerChanged);
            _colorpicker.setRGB({r:0, g:128, b:255});
            _colorpicker.setPosition('50%','50%');


            // update control values
            _colorPickerChanged(_colorpicker.getHSB(), _colorpicker.getRGB());
        };

        initialize();


        function _inputRgbChanged()
        {
            var color = _inputRGB.getText();
            color = Number(color.replace('#', '0x'));

            var rgb = {};

            if(!isNaN(color))
            {
                rgb.r = (color >> 16) & 0xFF;
                rgb.g = (color >> 8) & 0xFF;
                rgb.b = color & 0xFF;

                _colorpicker.setRGB(rgb);
            }
        }

        function _inputHsbChanged()
        {
            var values = _inputHSB.getText().split(',');
            var hsb = {};

            hsb.h = parseFloat(values[0]);
            hsb.s = parseFloat(values[1]) / 100;
            hsb.b = parseFloat(values[2]) / 100;

            if(!isNaN(hsb.h) && !isNaN(hsb.s) && !isNaN(hsb.b)) _colorpicker.setHSB(hsb);
        }



        function _sliderRadiusChanged()
        {
            _colorpicker.setRadius(_sliderOuter.getValue(), _sliderInner.getValue());
        }


        function _sliderSpacingChanged()
        {
            _colorpicker.setSpacing(_sliderSpacing.getValue());
        }

        function _shadowChange()
        {
            var shadowMode = null;

            if(_radioInner.getSelected()) shadowMode = 'inner';
            else if(_radioOuter.getSelected()) shadowMode = 'outer';

            _colorpicker.setShadowMode(shadowMode);
        }





        function _colorPickerChanged(hsb, rgb){
//            console.log(hsb, rgb);

            _inputRGB.setText(uintToWebString(rgb.r << 16 | rgb.g << 8 | rgb.b));
            _inputHSB.setText(hsb.h.toFixed(0) + ',' + (hsb.s * 100).toFixed(0) + ',' + (hsb.b*100).toFixed(0));
        }


        //
        // HELPER
        //


        function uintToWebString(color, len)
        {
            len = len || 6

            var str = color.toString(16).toUpperCase();
            while(str.length < len) str = "0" + str;
            return "#" + str.toUpperCase();
        }



    }


    //
    return DemoApp;

}(window, jQuery));



