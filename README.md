SiberianEhr
===========

measuredUnit
------------

Widget to wrap DVQuantity element.

Usage:

```javascript
$('#measured-input').measuredUnit([options]);
```

Options:

* ``DefaultValue``: Current value of DV_Quantity
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

Example: Human body temperature field. Assumed value - "36.6 C". Bounds - alive human being bode temperature - from 35 to 42 degrees. Can be converted to Fahrenheight
	
```javascript
$('#measured-input1').measuredUnit({
	AssumedValue: { Value: 36.6, Unit: 'C' },
	DefaultValue: { Value: 36.6, Unit: 'C' },
	Required : true,
	Units: {
		'C' : {
			precision: 1,
			minValue: 35,
			maxValue: 42
		},
		'F' : {
			precision: 1,
			minValue: 95,
			maxValue: 107.6
		}
	},
	PropertyName : 'temperature',
	getValueConverter: function (property, fromUnit, toUnit){
		switch(property){
			case 'temperature':
				if (fromUnit === 'C'  && toUnit === 'F'){
					return function (value) {
						return (value * 9 / 5 + 32);
					};
				}
				if (fromUnit === 'F'  && toUnit === 'C'){
					return function (value) {
						return ((value - 32) * 5 / 9);
					}
				}
		}
	}
});
```
