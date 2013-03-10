---
layout: default
title: SiberianEHR documentation
---

Installation
============

[Download](https://github.com/ilizunov/SiberianEhr/zipball/master) package, unzip it.

Place on your page following css styles (assumed files are unpacked to ``sehr`` folder)

    {% highlight html %}
<link rel="stylesheet" type="text/css" href="sehr/css/bootstrap.css">
<link rel="stylesheet" type="text/css" href="sehr/css/datepicker.css">
<link rel="stylesheet" type="text/css" href="sehr/css/bootstrap-timepicker.css">
    {% endhighlight %}

and js:

    {% highlight html %}
<script type="text/javascript" src="sehr/js/vendor/jquery-1.9.0.js"></script>
<script type="text/javascript" src="sehr/js/vendor/bootstrap.js"></script>
<script type="text/javascript" src="sehr/js/vendor/underscore.js"></script>
<script type="text/javascript" src="sehr/js/vendor/backbone.js"></script>
<script type="text/javascript" src="sehr/js/vendor/rivets.js"></script>
<script type="text/javascript" src="sehr/js/vendor/handlebars.js"></script>
<script type="text/javascript" src="sehr/js/vendor/rivets.js"></script>
<script type="text/javascript" src="sehr/js/vendor/jquery.blockUI.js"></script>
<script type="text/javascript" src="sehr/js/plugins.js"></script>
<script type="text/javascript" src="sehr/js/siberianehr.js"></script>

<script src="sehr/js/vendor/moment.js"></script>
<script src="sehr/js/vendor/bootstrap-datepicker.js"></script>
<script src="sehr/js/vendor/bootstrap-timepicker.js"></script>
<script src="sehr/js/templates/datetimepicker-tmpl.js"></script>
<script src="sehr/js/datetimepicker.js"></script>
<script src="sehr/js/templates/measuredunit-tmpl.js"></script>
<script src="sehr/js/measuredunit.js"></script>
    {% endhighlight %}

_don't worry, pre-built version will be available shortly :)_



Usage
=====


In general, SiberianEHR widgets are made as jQuery plugins. So usage is very simple:

    {% highlight javascript %}
$("selector").pluginName([options]);
    {% endhighlight %}

If ``$("selector")`` returns more than one element, widget will be initialized on both of them.


Measured unit widget
--------------------

Widget for measured values, with many measurement units. Widget provides callback for convertor function,
takes care about value's presicion and validation (required, min, max).

    {% highlight javascript %}
$('input').measuredUnit([options]);
    {% endhighlight %}

**Options**:

* ``DefaultValue``: Object represents the current value of DV_Quantity
    * ``Value``: measured value
    * ``Unit``: value's unit.
* ``AssumedValue``: the value set to the control if user has not touched it and nothing was passed as Value and Unit
	* ``Value``: assumed value itself
	* ``Unit``: assumed value unit
* ``Required``: specifies whether the value can be empty (``Required:false``) or not (``Required:true``)
* ``Units``: hashtable of possible unit measures
	* key is a string and contains measure
	* value is an object, containing:
		* ``precision``: Precision, in terms of number of decimal places. Value  0 implies integer value, -1 implies no rounding and the value is stored as is
		* ``minValue``: minimal bound of value
        * ``maxValue``: maximal bound of value
* ``PropertyName``: Name of the measured property, e.g. "temperature". Used in value conversion.
* ``getValueConverter``: function fabric that returns function-converter for chosen ``property``, ``fromUnit``, ``toUnit``


Datetime picker widget
----------------------

Widget implements datepicker with rare functionality: it can select year, month and date with optional parameter.
Only datepicker works for now.

    {% highlight javascript %}
$('input').dateTimePicker([options]);
    {% endhighlight %}

**Options**:

* ``format``: String, looks like 'YYYY-MM-??TXX:XX:XX' (see [ISO-8601](http://en.wikipedia.org/wiki/ISO_8601)).
    - If position contains ``X``, it is considered empty,
    - if position contains ``?`` - it is optional,
    - if position contains a date format letter (Y,M,D) - position considered to be filled
* ``localDateFormat``: Format to recognize that user can type in input
* ``Magnitude``: Number, represents value in miliseconds from start of epoch (Christmas)
