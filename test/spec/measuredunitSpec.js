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
                    var conversionRuleNotFoundMsg = 'Conversion rule not found';
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
                            throw new Error(conversionRuleNotFoundMsg);
                            break;
                        default:
                            throw new Error(conversionRuleNotFoundMsg);
                            break;
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

        it('should have 7 rivets bindings', function(){
            view.render();
            /** 1 & 2 - input field & comboBox current value
             * 3 - placeholder
             * 4 & 5 - labels indicating value with measure
             * 6 - error state (disabled comboBox)
             * 7 - comboBox variety (units) */
            expect(view.rivets.bindings.length).toEqual(7);
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

    describe("plugin validation - required no assumed value", function(){
        var view;
        beforeEach(function(){
            view = new SiberianEHR.MeasuredUnitView({
                model: new SiberianEHR.MeasuredUnit({
                    Value: 30,
                    Unit: 'kg',
                    Units:{
                        'kg' : {}
                    }
                }),
                Required: true
            })
        });

        it('Should show error on passing empty value', function(){
            view.render();
            view.$el.find('input[name=Value]').val('');
            view.validate();
            expect(view.$el.find('.help-inline').text().length).toBeGreaterThan(1);
        });
    });

    describe("plugin validation - required, there is assumed value", function(){
        var view;
        beforeEach(function(){
            view = new SiberianEHR.MeasuredUnitView({
                model: new SiberianEHR.MeasuredUnit({
                        AssumedValue: { Value: 36.6, Unit: "C" },
                        Value: 36.6,
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
                        Unit: 'C',
                        PropertyName : 'temperature',
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
                }),
                Required:true
            });
        });

        it('Should set assumed value on passing empty value', function(){
            view.render();
            view.model.set('Value','');
            view.validate(); // to explicitly view the difference
            expect(view.model.get('Value')).toEqual('36.6');
        });

        it('Should set assumed value in different measure on passing empty value, when measure value was changed', function(){
            view.render();
            view.model.set('Unit', 'F');
            view.model.set('Value','');
            view.validate();
            expect(view.model.get('Value')).toEqual('97.9');
        });
    });
});
