var mc = {};
mc.style = {
    fontSize : 10,
    fontName : "sans-serif",
    shadowColor : "#888888",
    borderColor : "#999999",
    buttonDownColor : "#bbbbbb",
    buttonOverColor : "#cccccc",
    buttonUpColor : "#ffffff",
    highlightColor : "#eeeeee",
    labelColor : "#333333",
    inputTextBGColor : "#eeeeee"
}


mc.drawRect = function(context, x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

mc.initComp = function(comp, parent, x, y) {
    comp.canvas = $("<canvas width='100' height='100'/>").get(0);
    comp.context = comp.canvas.getContext("2d");
    $(comp.canvas).css("position", "absolute");
    $(parent).append(comp.canvas);
    comp.move(x, y);
}

mc.initCompClass = function(compClass) {
    
    compClass.prototype.drawLabel = function(text, x, y) {
        this.context.font = mc.style.fontSize + "px " + mc.style.fontName;
        this.context.textBaseline = "top";
        this.context.fillStyle = mc.style.labelColor;
        this.context.fillText(text, x, y);
    };
    
    compClass.prototype.measureText = function(text) {
        this.context.font = mc.style.fontSize + "px " + mc.style.fontName;
        return this.context.measureText(text).width;
    };
    
    compClass.prototype.move = function(x, y) {
        this._x = x;
        this._y = y;
        $(this.canvas)
            .css("top", this._y)
            .css("left", this._x);
        return this;
    };
    
    compClass.prototype.setSize = function(w, h) {
        this.canvas.width = this._width = w;
        this.canvas.height = this._height = h;
        this.draw();
        return this;
    };
    
    compClass.prototype.getWidth = function() {
        return this._width;
    };
    
    compClass.prototype.setWidth = function(w) {
        this.canvas.width = this._width = w;
        this.draw();
        return this;
    };
    
    compClass.prototype.getHeight = function() {
        return this._height;
    };
    
    compClass.prototype.setHeight = function(h) {
        this.canvas.height = this._height = h;
        this.draw();
        return this;
    };
    
    compClass.prototype.getX = function() {
        return this._x;
    };
    
    compClass.prototype.setX = function(x) {
        this._x = x;
        $(this.canvas)
            .css("left", this._x);
        return this;
    };
    
    compClass.prototype.getY = function() {
        return this._y;
    };
    
    compClass.prototype.setY = function(y) {
        $(this.canvas)
            .css("top", this._y)
        return this;
    };
    
    compClass.prototype.drawRect = function(x, y, w, h, color) {
        this.context.fillStyle = color;
        this.context.fillRect(x, y, w, h);
    };
    
    compClass.prototype.drawCircle = function(x, y, r, color) {
        this.context.fillStyle = color;
        this.context.beginPath();
        this.context.arc(x, y, r, 0, Math.PI * 2, false);
        this.context.fill();
    };
    
    compClass.prototype.getPagePosition = function() {
        var x = 0, y = 0, element = this.canvas;
        do {
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
        } while(element != undefined);
        return {x:x, y:y};
    };

};

mc.HSlider = function(parent, x, y, handler) {
    mc.initComp(this, parent, x, y);
    this.handler = handler;
    this.mouseIsOver = false;
    this._minimum = 0;
    this._maximum = 100;
    this._value = 0;
    this.setSize(this._width = 110,
                 this._height = 10);
    this.calculateHandle();
    this.draw();
    this._continuous = true;
    $(this.canvas).css("cursor", "pointer");
    $(this.canvas).mouseover($.proxy(this.onMouseOver, this));
    $(this.canvas).mouseout($.proxy(this.onMouseOut, this));
    $(this.canvas).mousedown($.proxy(this.onMouseDown, this));
}

mc.initCompClass(mc.HSlider);

mc.HSlider.prototype.draw = function() {
    this.drawBack();
    this.drawHandle();
}

mc.HSlider.prototype.drawBack = function() {
    this.drawRect(0, 0, this._width, this._height, mc.style.shadowColor);
    this.drawRect(1.5, 1.5, this._width - 1.5, this._height - 1.5, "#d0d0d0");
}

mc.HSlider.prototype.drawHandle = function() {
    this.drawRect(this.handleX + 1, 1, this._height - 2, this._height - 2, mc.style.highlightColor);
    this.drawRect(this.handleX + 2, 2, this._height - 2, this._height - 2, mc.style.shadowColor);
    this.drawRect(this.handleX + 2, 2, this._height - 3, this._height - 3, mc.style.buttonDownColor);
}

mc.HSlider.prototype.calculateHandle = function() {
    var range = this._maximum - this._minimum;
    var percent = (this._value - this._minimum) / range;
    var w = this._width - this._height;
    this.handleX = w * percent;
}

mc.HSlider.prototype.onMouseOver = function(event) {
    this.mouseIsOver = true;
}

mc.HSlider.prototype.onMouseOut = function(event) {
    this.mouseIsDown = false;
    this.mouseIsOver = false;
}

mc.HSlider.prototype.onMouseDown = function(event) {
    this.mouseIsDown = true;
    var x = event.pageX - this.getPagePosition().x;
    if(x >= this.handleX &&
       x <= this.handleX + this._height) {
        this.dragging = true;
        this.dragOffset = x - this.handleX;
        $(document).bind("mouseup", $.proxy(this.onMouseUp, this));
        $(document).bind("mousemove", $.proxy(this.onMouseMove, this));
    }
    else {
        this.handleX = Math.max(0, x - this._height / 2);
        this.handleX = Math.min(this._width - this._height, this.handleX);
        this.calculateValue();
        this.draw();
        if(this.handler) {
            this.handler(this);
        }
        this.updateLabel();
    }
}

mc.HSlider.prototype.onMouseUp = function(event) {
    if(this.dragging) {
        if(this.handler) {
            this.handler(this);
        }
        this.updateLabel();
    }
    this.mouseIsDown = false;
    this.dragging = false;
    $(document).unbind("mouseup", $.proxy(this.onMouseUp, this));
    $(document).unbind("mousemove", $.proxy(this.onMouseMove, this));
}

mc.HSlider.prototype.onMouseMove = function(event) {
    if(this.dragging) {
        var x = event.pageX - this.getPagePosition().x;
        this.handleX = x - this.dragOffset;
        this.handleX = Math.min(this.handleX, this._width - this._height);
        this.handleX = Math.max(this.handleX, 0);
        
        this.calculateValue();
        if(this._continuous && this.handler) {
            this.handler(this);
        }
        this.updateLabel();
        this.draw();
    }
}

mc.HSlider.prototype.updateLabel = function() {
    if(this.label) {
        this.label.setText(this.getValue(this.labelPrecision));
    }    
}

mc.HSlider.prototype.calculateValue = function() {
    var range = this._maximum - this._minimum;
    var w = this._width - this._height;
    this._value = this._minimum + this.handleX / w * range;
    this._value = Math.min(this._value, this._maximum);
    this._value = Math.max(this._value, this._minimum);
    this.draw();
}

mc.HSlider.prototype.setSliderParams = function(min, max, value) {
    this._minimum = min;
    this._maximum = max;
    this._value = value;
    this.calculateHandle();
    this.draw();
    return this;
}

mc.HSlider.prototype.setValue = function(val) {
    this._value = val;
    this.calculateHandle();
    this.draw();
    return this;
}

mc.HSlider.prototype.getValue = function(precision) {
    if(precision == undefined) {
        return this._value;        
    }
    var mult = Math.pow(10, precision);
    return Math.round(this._value * mult) / mult;
}

mc.HSlider.prototype.setMaximum = function(max) {
    this._maximum = max;
    this.calculateHandle();
    this.draw();
    return this;
}

mc.HSlider.prototype.getMaximum = function() {
    return this._maximum;
}

mc.HSlider.prototype.setMinimum = function(min) {
    this._minimum = min;
    this.calculateHandle();
    this.draw();
    return this;
}

mc.HSlider.prototype.getMinimum = function() {
    return this._minimum;
}

mc.HSlider.prototype.bindLabel = function(label, precision) {
    this.label = label;
    this.labelPrecision = precision;
    this.updateLabel();
    return this;
}

mc.HSlider.prototype.setContinuous = function(bool) {
    this._continuous = bool;
    return this;
}

mc.HSlider.prototype.getContinuous = function() {
    return this._continuous;
}
mc.Pushbutton = function(parent, x, y, label, handler) {
    mc.initComp(this, parent, x, y);
    this._label = label;
    this.handler = handler;
    this.mouseIsOver = false;
    this.mouseIsDown = false;
    this.setSize(100, mc.style.fontSize + 8);
    $(this.canvas).css("cursor", "pointer");
    $(this.canvas).mouseover($.proxy(this.onMouseOver, this));
    $(this.canvas).mouseout($.proxy(this.onMouseOut, this));
    $(this.canvas).mousedown($.proxy(this.onMouseDown, this));
    $(this.canvas).mouseup($.proxy(this.onMouseUp, this));
}

mc.initCompClass(mc.Pushbutton);

mc.Pushbutton.prototype.onMouseOver = function(event) {
    this.mouseIsOver = true;
    this.draw();
}

mc.Pushbutton.prototype.onMouseOut = function(event) {
    this.mouseIsDown = false;
    this.mouseIsOver = false;
    this.draw();
}

mc.Pushbutton.prototype.onMouseDown = function(event) {
    this.mouseIsDown = true;
    this.draw();
}

mc.Pushbutton.prototype.onMouseUp = function(event) {
    if(this.mouseIsOver && this.mouseIsDown && this.handler != null) {
        this.handler(this);
    }
    this.mouseIsDown = false;
    this.draw();
}

mc.Pushbutton.prototype.draw = function() {
    this.drawBorder();
    this.drawFace();
    this.drawText();
};

mc.Pushbutton.prototype.drawBorder = function() {
    if(this.mouseIsDown) {
        this.drawRect(0, 0, this._width, this._height, mc.style.shadowColor);
    }
    else {
        this.drawRect(0, 0, this._width, this._height, mc.style.borderColor);
    }
};

mc.Pushbutton.prototype.drawFace = function() {
    if(this.mouseIsDown) {
        this.drawRect(1.5, 1.5, this._width - 1.5, this._height - 1.5, mc.style.buttonDownColor);
    }
    else if(this.mouseIsOver) {
        this.drawRect(1, 1, this._width - 2, this._height - 2, mc.style.buttonOverColor);
    }
    else {
        this.drawRect(1, 1, this._width - 2, this._height - 2, mc.style.buttonUpColor);
    }
};

mc.Pushbutton.prototype.drawText = function() {    
    var textWidth = this.measureText(this._label);
    this.drawLabel(this._label, (this._width - textWidth) / 2, (this._height - mc.style.fontSize) / 2);
};

mc.Pushbutton.prototype.setLabel = function(label) {
    this._label = label;
    this.draw();
    return this;
}

mc.Pushbutton.prototype.getLabel = function() {
    return this._label;
}
mc.InputText = function(parent, x, y, text, handler) {
    this.handler = handler;
    this._text = text;
    this.input = $("<input type='text'/>")
        .css("position", "absolute")
        .css("left", x)
        .css("top", y)
        .css("font-family", mc.style.fontName)
        .css("font-size", mc.style.fontSize)
        .css("color", mc.style.fontColor)
        .css("border-style", "solid")
        .css("border-width", "1px")
        .css("outline-style", "none")
        .css("border-left-color", mc.style.shadowColor)
        .css("border-top-color", mc.style.shadowColor)
        .css("border-right-color", mc.style.highlightColor)
        .css("border-bottom-color", mc.style.highlightColor)
        .css("background-color", mc.style.inputTextBGColor);
    this.input.attr("value", text)
    this.input.keyup($.proxy(this.onTextChange, this));
    $(parent).append(this.input);
    this.move(x, y);
    this._width = this.input.attr("width");
    this._height = this.input.attr("height");
}

mc.InputText.prototype.onTextChange = function() {
    var oldText = this._text;
    this._text = this.input.attr("value");
    if(this.handler && oldText != this._text) {
        this.handler();
    }
}

mc.InputText.prototype.setText = function(text) {
    this._text = text;
    this.input.attr("value", text);
    //this.draw();
    return this;
}

mc.InputText.prototype.getText = function() {
    return this._text;
}

mc.InputText.prototype.move = function(x, y) {
    this._x = x;
    this._y = y;
    this.input
        .css("top", this._y)
        .css("left", this._x);
    return this;
};

mc.InputText.prototype.setSize = function(w, h) {
    this._width = w;
    this._height = h;
    this.input
        .css("width", this._width)
        .css("height", this._height);
    return this;
};

mc.InputText.prototype.getWidth = function() {
    return this._width;
};

mc.InputText.prototype.setWidth = function(w) {
    this._width = w;
    this.input.css("width", this._width);
    return this;
};

mc.InputText.prototype.getHeight = function() {
    return this._height;
};

mc.InputText.prototype.setHeight = function(h) {
    this._height = h;
    this.input.css("height", this._height);
    return this;
};

mc.InputText.prototype.getX = function() {
    return this._x;
};

mc.InputText.prototype.setX = function(x) {
    this._x = x;
    $(this.input)
        .css("left", this._x);
    return this;
};

mc.InputText.prototype.getY = function() {
    return this._y;
};

mc.InputText.prototype.setY = function(y) {
    $(this.input)
        .css("top", this._y)
    return this;
};
mc.RadioButton = function(parent, x, y, label, selected, handler) {
    mc.initComp(this, parent, x, y);
    this._label = label;
    this.handler = handler;
    this._selected = selected;
    if(this._selected) {
        mc.RadioButton.selectedButton = this;
    }
    mc.RadioButton.group.push(this);
    this.mouseIsOver = false;
    this.mouseIsDown = false;
    this.draw();
    $(this.canvas).css("cursor", "pointer");
    $(this.canvas).mouseover($.proxy(this.onMouseOver, this));
    $(this.canvas).mouseout($.proxy(this.onMouseOut, this));
    $(this.canvas).mousedown($.proxy(this.onMouseDown, this));
    $(this.canvas).mouseup($.proxy(this.onMouseUp, this));
}

mc.initCompClass(mc.RadioButton);
mc.RadioButton.group = [];

mc.RadioButton.clearAll = function() {
    for(var i = 0; i < mc.RadioButton.group.length; i += 1) {
        var rb = mc.RadioButton.group[i];
        rb.setSelected(false);
    }
}


mc.RadioButton.prototype.onMouseOver = function(event) {
    this.mouseIsOver = true;
}

mc.RadioButton.prototype.onMouseOut = function(event) {
    this.mouseIsOver = false;
    this.mouseIsDown = false;
}

mc.RadioButton.prototype.onMouseDown = function(event) {
    this.mouseIsDown = true;
}

mc.RadioButton.prototype.onMouseUp = function(event) {
    if(this.mouseIsOver && this.mouseIsDown) {
        mc.RadioButton.clearAll();
        mc.RadioButton.selectedButton = this;
        this._selected = true;
        this.drawRadio();
        if(this.handler != undefined) {
            this.handler(this);
        }
    }
    this.mouseIsDown = false;
}

mc.RadioButton.prototype.draw = function() {
    this.canvas.width = this._width = this.measureText(this._label) + mc.style.fontSize + 3;
    this.canvas.height = this._height = mc.style.fontSize + 1;
    this.drawRadio();
    this.drawLabel(this._label, mc.style.fontSize + 3, 0);
}

mc.RadioButton.prototype.drawRadio = function() {
    var radius = mc.style.fontSize / 2
    this.drawCircle(radius, radius, radius, mc.style.borderColor);
    this.drawCircle(radius, radius, radius - 1, mc.style.buttonUpColor);
    
    if(this._selected) {
        this.drawCircle(radius, radius, radius - 3, mc.style.shadowColor);
    }
}

mc.RadioButton.prototype.setSelected = function(sel) {
    this._selected = sel;
    if(this._selected) {
        mc.RadioButton.selectedButton = this;
    }
   this.drawRadio();
   return this;
}

mc.RadioButton.prototype.getSelected = function() {
    return this._selected;
}

mc.RadioButton.prototype.setLabel = function(label) {
    this._label = label;
    this.drawRadio();
    return this;
}

mc.RadioButton.prototype.getLabel = function() {
    return this._label;
}

mc.Label = function(parent, x, y, text) {
    mc.initComp(this, parent, x, y);
    this._text = text || "";
    this._align = "left";
    this.draw();
}

mc.initCompClass(mc.Label);

mc.Label.prototype.setText = function(text) {
    this._text = text;
    this.draw();
    return this;
}

mc.Label.prototype.getText = function() {
    return this._text;
}

mc.Label.prototype.draw = function() {
    this.canvas.width = this._width = this.measureText(this._text);
    this.canvas.height = this._height = mc.style.fontSize + 1;
    this.drawLabel(this._text, 0, 0);
    
    if(this._align == "right") {
        $(this.canvas).css("left", this._x - this.canvas.width);
    }
    else if(this._align == "center") {
        $(this.canvas).css("left", this._x - this.canvas.width / 2);
    } else {
        $(this.canvas).css("left", this._x);
    }
}

mc.Label.prototype.setAlign = function(align) {
    this._align = align;
    this.draw();
    return this;
}

mc.Label.prototype.getAlign = function() {
    return this._align;
}
mc.VSlider = function(parent, x, y, handler) {
    mc.initComp(this, parent, x, y);
    this.handler = handler;
    this.mouseIsOver = false;
    this._minimum = 0;
    this._maximum = 100;
    this._value = 0;
    this.canvas.width = this._width = 10;
    this.canvas.height = this._height = 110;
    this.calculateHandle();
    this.draw();
    this._continuous = true;
    $(this.canvas).css("cursor", "pointer");
    $(this.canvas).mouseover($.proxy(this.onMouseOver, this));
    $(this.canvas).mouseout($.proxy(this.onMouseOut, this));
    $(this.canvas).mousedown($.proxy(this.onMouseDown, this));
}

mc.initCompClass(mc.VSlider);

mc.VSlider.prototype.draw = function() {
    this.drawBack();
    this.drawHandle();
}

mc.VSlider.prototype.drawBack = function() {
    this.drawRect(0, 0, this._width, this._height, mc.style.shadowColor);
    this.drawRect(1.5, 1.5, this._width - 1.5, this._height - 1.5, "#d0d0d0");
}

mc.VSlider.prototype.drawHandle = function() {
    this.drawRect(1, this.handleY + 1, this._width - 2, this._width - 2, mc.style.highlightColor);
    this.drawRect(2, this.handleY + 2, this._width - 2, this._width - 2, mc.style.shadowColor);
    this.drawRect(2, this.handleY + 2, this._width - 3, this._width - 3, mc.style.buttonDownColor);
}

mc.VSlider.prototype.calculateHandle = function() {
    var range = this._maximum - this._minimum;
    var percent = (this._value - this._minimum) / range;
    var h = this._height - this._width;
    this.handleY = h - h * percent;
}

mc.VSlider.prototype.onMouseOver = function(event) {
    this.mouseIsOver = true;
}

mc.VSlider.prototype.onMouseOut = function(event) {
    this.mouseIsDown = false;
    this.mouseIsOver = false;
}

mc.VSlider.prototype.onMouseDown = function(event) {
    this.mouseIsDown = true;
    var y = event.pageY - this.getPagePosition().y;
    if(y >= this.handleY &&
       y <= this.handleY + this._width) {
        this.dragging = true;
        this.dragOffset = y - this.handleY;
        $(document).bind("mouseup", $.proxy(this.onMouseUp, this));
        $(document).bind("mousemove", $.proxy(this.onMouseMove, this));
    }
    else {
        this.handleY = Math.max(0, y - this._width / 2);
        this.handleY = Math.min(this._height - this._width, this.handleY);
        this.calculateValue();
        this.draw();
        if(this.handler) {
            this.handler(this);
        }
        this.updateLabel();
    }
}

mc.VSlider.prototype.onMouseUp = function(event) {
    if(this.dragging) {
        if(this.handler) {
            this.handler(this);
        }
        this.updateLabel();
    }
    this.mouseIsDown = false;
    this.dragging = false;
    $(document).unbind("mouseup", $.proxy(this.onMouseUp, this));
    $(document).unbind("mousemove", $.proxy(this.onMouseMove, this));
}

mc.VSlider.prototype.onMouseMove = function(event) {
    if(this.dragging) {
        var y = event.pageY - this.getPagePosition().y;
        this.handleY = y - this.dragOffset;
        this.handleY = Math.min(this.handleY, this._height - this._width);
        this.handleY = Math.max(this.handleY, 0);
        
        this.calculateValue();
        if(this._continuous && this.handler) {
            this.handler(this);
        }
        this.updateLabel();
        this.draw();
    }
}

mc.VSlider.prototype.updateLabel = function() {
    if(this.label) {
        this.label.setText(this.getValue(this.labelPrecision));
    }    
}

mc.VSlider.prototype.calculateValue = function() {
    var range = this._maximum - this._minimum;
    var h = this._height - this._width;
    this._value = this._minimum + (h - this.handleY) / h * range;
    this._value = Math.min(this._value, this._maximum);
    this._value = Math.max(this._value, this._minimum);
    this.draw();
}

mc.VSlider.prototype.setSliderParams = function(min, max, value) {
    this._minimum = min;
    this._maximum = max;
    this._value = value;
    this.calculateHandle();
    this.draw();
    return this;
}

mc.VSlider.prototype.setValue = function(val) {
    this._value = val;
    this.calculateHandle();
    this.draw();
    return this;
}

mc.VSlider.prototype.getValue = function(precision) {
    if(precision == undefined) {
        return this._value;        
    }
    var mult = Math.pow(10, precision);
    return Math.round(this._value * mult) / mult;
}

mc.VSlider.prototype.setMaximum = function(max) {
    this._maximum = max;
    this.calculateHandle();
    this.draw();
    return this;
}

mc.VSlider.prototype.getMaximum = function() {
    return this._maximum;
}

mc.VSlider.prototype.setMinimum = function(min) {
    this._minimum = min;
    this.calculateHandle();
    this.draw();
    return this;
}

mc.VSlider.prototype.getMinimum = function() {
    return this._minimum;
}

mc.VSlider.prototype.bindLabel = function(label, precision) {
    this.label = label;
    this.labelPrecision = precision;
    this.updateLabel();
    return this;
}

mc.VSlider.prototype.setContinuous = function(bool) {
    this._continuous = bool;
    return this;
}

mc.VSlider.prototype.getContinuous = function() {
    return this._continuous;
}
mc.CheckBox = function(parent, x, y, label, selected, handler) {
    mc.initComp(this, parent, x, y);
    this._label = label;
    this.handler = handler;
    this._selected = selected;
    this.mouseIsOver = false;
    this.mouseIsDown = false;
    this.draw();
    $(this.canvas).css("cursor", "pointer");
    $(this.canvas).mouseover($.proxy(this.onMouseOver, this));
    $(this.canvas).mouseout($.proxy(this.onMouseOut, this));
    $(this.canvas).mousedown($.proxy(this.onMouseDown, this));
    $(this.canvas).mouseup($.proxy(this.onMouseUp, this));
}

mc.initCompClass(mc.CheckBox);

mc.CheckBox.prototype.onMouseOver = function(event) {
    this.mouseIsOver = true;
}

mc.CheckBox.prototype.onMouseOut = function(event) {
    this.mouseIsOver = false;
    this.mouseIsDown = false;
}

mc.CheckBox.prototype.onMouseDown = function(event) {
    this.mouseIsDown = true;
}

mc.CheckBox.prototype.onMouseUp = function(event) {
    if(this.mouseIsOver && this.mouseIsDown) {
        this._selected = !this._selected;
        if(this.handler != undefined) {
            this.handler(this);
        }
    }
    this.mouseIsDown = false;
    this.drawCheck();
}

mc.CheckBox.prototype.draw = function() {
    this.canvas.width = this._width = this.measureText(this._label) + mc.style.fontSize + 3;
    this.canvas.height = this._height = mc.style.fontSize + 1;
    this.drawCheck();
    this.drawLabel(this._label, mc.style.fontSize + 3, 0);
}

mc.CheckBox.prototype.drawCheck = function() {
    this.drawRect(0, 0, mc.style.fontSize, mc.style.fontSize, mc.style.shadowColor);
    this.drawRect(1.5, 1.5, mc.style.fontSize - 1.5, mc.style.fontSize - 1.5, mc.style.buttonUpColor);
    
    if(this._selected) {
        this.drawRect(2, 2, mc.style.fontSize - 4, mc.style.fontSize - 4, mc.style.highlightColor);
        this.drawRect(3, 3, mc.style.fontSize - 5, mc.style.fontSize - 5, mc.style.shadowColor);
        this.drawRect(3, 3, mc.style.fontSize - 6, mc.style.fontSize - 6, mc.style.buttonDownColor);
    }
}

mc.CheckBox.prototype.setLabel = function(label) {
    this._label = label;
    this.draw();
    return this;
}

mc.CheckBox.prototype.getLabel = function() {
    return this._label;
}

mc.CheckBox.prototype.setSelected = function(sel) {
    this._selected = sel;
    this.drawCheck();
    return this;
}

mc.CheckBox.prototype.getSelected = function() {
    return this._selected;
}

