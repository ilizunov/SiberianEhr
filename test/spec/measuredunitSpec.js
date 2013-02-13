/**
 * Examples:
 * http://tinnedfruit.com/2011/03/03/testing-backbone-apps-with-jasmine-sinon.html
 * http://net.tutsplus.com/tutorials/javascript-ajax/building-and-testing-a-backbone-app/
 */
describe("Measured Unit widget", function () {
    describe("data model", function () {
        var model;

        beforeEach(function () {
            model = new SiberianEHR.MeasuredUnit({
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

    describe("rendering", function(){
        var view;
        beforeEach(function(){
            view = new SiberianEHR.MeasuredUnitView({
                model: new SiberianEHR.MeasuredUnit({
                    Value: 30,
                    Unit: 'kg',
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
                Value: 1
            });
        });

        it('should set data attribute to container', function(){
            expect($(element)).toHaveData('view');
        });
    });

    describe("model validation", function () {
        var model, foo;
        beforeEach(function () {
            model = new SiberianEHR.MeasuredUnit({
                Value: 10,
                Unit: 'kg',
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

        it("should pass AssumedValue if empty value is passed and Required=true", function(){
            model.set({AssumedValue: {Unit: 'kg', Value: 50}});
            model.set({Value: ''});
            expect(model.get('Value')).toEqual(50);
        });

        it("should pass AssumedValue in different measure if selected", function(){
            model.set({
                AssumedValue: {Unit: 'kg', Value: 5000},
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
                Units:{ 'kg':{}, 't': {} }
            });
            model.set({Unit: 't'});
            model.set({Value: ''});
            expect(model.get('Value')).toEqual(5);
        });
    });

    describe("model value precision", function(){
        var model;

        beforeEach(function () {
            model = new SiberianEHR.MeasuredUnit({
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
                Value: 10,
                Unit: 'kg'
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
});
