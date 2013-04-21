/**
 * Examples:
 * http://tinnedfruit.com/2011/03/03/testing-backbone-apps-with-jasmine-sinon.html
 * http://net.tutsplus.com/tutorials/javascript-ajax/building-and-testing-a-backbone-app/
 */
describe("Measured Unit widget", function () {
    describe("data model", function () {
        var model;

        beforeEach(function () {
            model = new SiberianEHR.MeasuredUnit.MeasuredUnitModel({
                PropertyName : 'weight',
                getValueConverter: function (property, fromUnit, toUnit){
                    switch(property){
                        case 'weight':
                            if (fromUnit === 'kg'  && toUnit === 't'){
                                return function (value) {
                                    return value / 1000;
                                };
                            }
                            if (fromUnit === 't'  && toUnit === 'kg'){
                                return function (value) {
                                    return value * 1000;
                                }
                            }
                    }
                },
                Units:{
                    'kg':{},
                    't':{}
                }
            });
        });

        it("should convert from kg to tons", function () {
            model.set({Value: 1500, Unit: 'kg'});
            model.set('Unit', 't');
            expect(model.get('Value')).toEqual(1.5);
        });

        it("should convert from tons to kg", function () {
            model.set({Value: 1, Unit: 't'});
            model.set('Unit', 'kg');
            expect(model.get('Value')).toEqual(1000);
        });
    });

    describe('data model serialization-deserialization',function(){
        var model;
        beforeEach(function(){
            model = SiberianEHR.MeasuredUnit.deserialize({Value: 5, Unit: 'kg'});
        });
        it('should create a model with specified values', function(){
            expect(model.get('Value')).toEqual(5);
        });
        it('should deserialize model with current value',function(){
            model.set({Value: 6});
            expect(model.get('Value')).toEqual(SiberianEHR.MeasuredUnit.serialize(model).Value);
            expect(model.get('Unit')).toEqual(SiberianEHR.MeasuredUnit.serialize(model).Unit);
        });
    });

    describe("rendering", function(){
        var view;
        beforeEach(function(){
            view = new SiberianEHR.MeasuredUnit.MeasuredUnitView({
                model: new SiberianEHR.MeasuredUnit.MeasuredUnitModel({
                    DefaultValue: {
                        Value: 30,
                        Unit: 'kg'
                    },
                    Units:{
                        'kg' : {}
                    }
                })
            })
        });

        it('should set value to input', function(){
            view.render();
            expect($('input[type=text]', view.el)).toHaveValue('30');
        });

        it('should select Unit automatically', function(){
            view.render();
            expect($('option[value=kg]', view.el)).toBeSelected();
        });

    });

    describe("plugin initialization", function(){
        var element = $('<div id="container"></div> '),
            widget;

        beforeEach(function(){
            widget = $(element).measuredUnit({
                DefaultValue: {
                    Value: 1,
                    Unit: 'unit'
                }
            });
        });

        it('should set data attribute to container', function(){
            expect($(element)).toHaveData('view');
        });
    });

    describe("model validation", function () {
        var model, foo;
        beforeEach(function () {
            model = new SiberianEHR.MeasuredUnit.MeasuredUnitModel({
                DefaultValue: {
                    Value: 10,
                    Unit: 'kg'
                },
                Required: true,
                PropertyName: 'weight'
            });
            foo = {
                invalid_handler : function(){
                    return;
                }
            };
            spyOn(foo, 'invalid_handler');
            model.on('invalid', foo.invalid_handler, model);
        });

        it("should show error on empty value, because assumed value not set", function () {
            model.set({Value: ''});
            expect(foo.invalid_handler).toHaveBeenCalled();
        });
    });

    describe("model value precision", function(){
        var model;

        beforeEach(function () {
            model = new SiberianEHR.MeasuredUnit.MeasuredUnitModel({
                PropertyName : 'weight',
                getValueConverter: function (property, fromUnit, toUnit){
                    switch(property){
                        case 'weight':
                            if (fromUnit === 'kg'  && toUnit === 't'){
                                return function (value) {
                                    return value / 1000;
                                };
                            }
                            if (fromUnit === 't'  && toUnit === 'kg'){
                                return function (value) {
                                    return value * 1000;
                                }
                            }
                    }
                },
                Units:{
                    'kg':{precision: 0},
                    't':{precision: 2}
                },
                DefaultValue: {
                    Value: 10,
                    Unit: 'kg'
                }
            });
        });

        it("should allow only integer number of kilograms. If set 5.5 should automatically correct to 5",function(){
            model.set({Value:5.4});
            expect(parseFloat(model.get('Value'))).toEqual(5);
        });

        it("should recalculate precision at conversion 16.4kg => 0.02t",function(){
            model.set({Value:16.4});
            model.set({Unit:'t'});
            expect(parseFloat(model.get('Value'))).toEqual(0.02);
        });
    });

    describe("assumed value and user interaction", function(){
        var element = $('<div id="container"></div>'),
            widget, options;

        beforeEach(function(){
            options = {
                DefaultValue: {
                    Value: 1,
                    Unit: 'unit1x'
                },
                Units:{
                    'unit1x':{},
                    'unit2x':{}
                },
                getValueConverter: function (property, fromUnit, toUnit){
                    if (fromUnit === 'unit1x'  && toUnit === 'unit2x'){
                        return function (value) {
                            return value * 2;
                        }
                    };
                    if (fromUnit === 'unit2x'  && toUnit === 'unit1x'){
                        return function (value) {
                            return value / 2;
                        }
                    }
                }
            };
        });

        it("should fill in the placeholder with 5 (assumed value is 10 in different untis) on specifying empty value, whilst model value should be ''",function(){
            options.AssumedValue = {
                Value: 10,
                Unit: 'unit2x'
            };
            widget = $(element).measuredUnit(options);
            $(element).find('input[name=Value]').val('');
            expect(parseFloat($(element).find('input[name=Value]').attr('placeholder'))).toEqual(5);
            expect($(element).find('input[name=Value]').val()).toEqual('');
        });

        it("should fill in the placeholder with 10 (assumed value is in the same units) on specifying empty value, whilst model value should be ''",function(){
            options.AssumedValue = {
                Value: 10,
                Unit: 'unit1x'
            };
            widget = $(element).measuredUnit(options);
            $(element).find('input[name=Value]').val('');
            expect(parseFloat($(element).find('input[name=Value]').attr('placeholder'))).toEqual(10);
            expect($(element).find('input[name=Value]').val()).toEqual('');
        });
    });

    describe("min/max test", function(){
        var model, foo;
        beforeEach(function () {
            model = new SiberianEHR.MeasuredUnit.MeasuredUnitModel({
                DefaultValue: {
                    Value: 10,
                    Unit: 'kg'
                },
                Units:{
                    'kg': {minValue: 1, maxValue: 250, precision: 0}
                },
                Required: true,
                PropertyName: 'weight'
            });
            foo = {
                invalid_handler : function(){return;},
                valid_handler : function(){return;}
            };
            spyOn(foo, 'invalid_handler');
            spyOn(foo, 'valid_handler');
            model.on('invalid', foo.invalid_handler, model);
            model.on('valid', foo.valid_handler, model);
        });

        it("should show error on value less than minimal", function () {
            model.set({Value: -1});
            expect(foo.invalid_handler).toHaveBeenCalled();
        });

        it("should show error on value greater than minimal", function () {
            model.set({Value: 300});
            expect(foo.invalid_handler).toHaveBeenCalled();
        });

        it("should not show error on value within the bounds", function () {
            model.set({Value: 200});
            expect(foo.valid_handler).toHaveBeenCalled();
        });
    });

    describe("Value serialization/deserialization. JQuery plugin notation.", function(){
        var element = $('<div id="container"></div>'),
            widget, options;

        beforeEach(function(){
            options = {
                DefaultValue: {
                    Value: 160,
                    Unit: 'cm'
                },
                Units: {'cm':{}},
                Required : true,
                PropertyName : 'height'
            };
            element.measuredUnit(options);
        });

        it("should read value of widget as json",function(){
            var json = element.measuredUnit('value');
            expect(json.Value).toEqual(160);
            expect(json.Unit).toEqual('cm');
        });

        it("should write value (json) to widget",function(){
            var json = element.measuredUnit('value');
            json.Value = 200;
            element.measuredUnit('value', json);
            json = element.measuredUnit('value');
            expect(json.Value).toEqual(200);
            expect(json.Unit).toEqual('cm');
        });
    });

    describe("Value serialization/deserialization. Twitter plugin notation.", function(){
        var element = $('<div id="container"></div>'),
            widget, options;

        beforeEach(function(){
            options = {
                DefaultValue: {
                    Value: 160,
                    Unit: 'cm'
                },
                Units: {'cm':{}},
                Required : true,
                PropertyName : 'height'
            };
            element.measuredUnit(options);
            widget = element.measuredUnit('widget');
        });

        it("should read value of widget as json",function(){
            var json = widget.value();
            expect(json.Value).toEqual(160);
            expect(json.Unit).toEqual('cm');
        });

        it("should write value (json) to widget",function(){
            var json = widget.value();
            json.Value = 200;
            widget.value(json);
            json = widget.value();
            expect(json.Value).toEqual(200);
            expect(json.Unit).toEqual('cm');
        });
    });

    describe("Clear value test", function(){
        it("Model should set its values to null", function(){
            var model = new SiberianEHR.MeasuredUnit.MeasuredUnitModel({
                PropertyName : 'weight',
                DefaultValue: {Value: 10, Unit: 'kg'},
                Units:{'kg':{},'t':{}}
            });
            expect(model.get('Value')).toEqual(10);
            model.clearValue();
            expect(model.get('Value')).toBeNull();
        })
    });
});
