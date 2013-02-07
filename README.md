SiberianEhr
===========

measuredUnit
------------

Usage:

```javascript
$('#measured-input').measuredUnit([options]);
```

Options:

* Value: measured value
* Unit: value's unit.
* AssumedValue: the value set to the control if user has not touched it and nothing was passed as Value and Unit
	* Value: assumed value itself
	* Unit: assumed value unit
* Required: specifies whether the value can be empty (``Required:false``) or not (``Required:true``)
* Units: hashtable of possible unit measures
	* key is a string and contains measure
	* value is an object, containing:
		* precision: Precision, in terms of number of decimal places. Value  0 implies integer value, -1 implies no rounding and the value is stored as is
		* minValue: minimal bound of value
        * maxValue: maximal bound of value
* PropertyName: Name of the measured property, e.g. "temperature". Used in value conversion.
* getValueConverter: function fabric that returns function-converter for chosen ``property``, ``fromUnit``, ``toUnit``

Example: Human body temperature field. Assumed value - "36.6 C". Can be converted to Fahrenheight
	
```javascript
$('#measured-input1').measuredUnit({
	AssumedValue: { Value: 36.6, Unit: "C" },  // assumed value - the value set to the control if user has not touched it
	Value: 36.6,
	Required : true, // specifies whether this value must be filled in
	/** Array of possible measurement units
	 *  Unit structure - object. Key is measure
	 *  {
	 *      minValue: undefined,    // minimal value
	 *      maxValue: undefined,    // maximal value
	 *      //
	 *      // Precision, in terms of number of decimal places
	 *      // Value  0 implies integer value
	 *      // Value -1 implies no rounding, the value is stored as is
	 *      //
	 *      precision: -1
	 *  }*/
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
	Unit: 'C', // Current measurement unit value
	PropertyName : 'temperature', // Name of the measured property, e.g. "temperature"
	/**
	 * Sample measure unit converter to be exposed in measuredUnit widget
	 *
	 * @param property  {string}    Measured property name. This is the first part of the key to find a rule
	 *                              of conversion.
	 *                              When called a real function we should pass this.get('propertyName')
	 * @param fromUnit  {string}    Current measure unit name. This is the second part of the key.
	 * @param toUnit    {string}    New measure unit name. This is the last part of key.
	 *
	 * @return {function} Value, measured in new units
	 */
	getValueConverter: function (property, fromUnit, toUnit){
		var conversionRuleNotFoundMsg = 'Conversion rule not found';
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
				throw new Error(conversionRuleNotFoundMsg);
				break;
			default:
				throw new Error(conversionRuleNotFoundMsg);
				break;
		}
	}
});
```
