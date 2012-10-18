HSB Color Wheel
========

#### HTML5 port of my AS3 HSB Color Wheel ####

Two years ago I did some interface experiments because I always wanted to have some kind of circle color picker and
I came up with the [HSB Color Wheel](http://blog.formatlos.de/2010/03/27/hsb-color-wheel/). Finally I ported it to HTML5.


### Usage ###


```html
<script src="//ajax.googleapis.com/ajax/libs/jquery/1.8.0/jquery.min.js"></script>
<script>window.jQuery || document.write('<script src="js/vendor/jquery-1.8.0.min.js"><\/script>')</script>
<script src="js/HSBColorWheel.js"></script>
```

This code creates a color wheel with outer radius of 400px, a inner radius of 100px, 0px spacing and inner shadows

```html
<script>

    var colorpicker = new HSBColorWheel($('body'), 400, 100, 0, 'inner');

    // add callback for change
    colorpicker.onChange(function(hsb, rgb){
        console.log(hsb, rgb);
    });

    // set position
    colorpicker.setPosition('50%','50%');

    // set color with RGB value (r/g/b:0-255)
    colorpicker.setRGB({r:0, g:128, b:255});

    // set color with HSB value (h:0-360, s/b:0.0-1.0)
    colorpicker.setHSB({h:360, s:0.5, b:0.5});

</script>
```

### Change log ###

2010 04 24 - **initial commit**

* First alpha release