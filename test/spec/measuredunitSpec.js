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
                }
            });
        });

        it("should convert from kg to tonns", function () {
            model.set({Value: 1500, Unit: 'kg'});
            model.set('Unit', 't');
            expect(model.get('Value')).toEqual(1.5);
        });

        it("should convert from tonns to kg", function () {
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
                    Unit: 'kg'
                })
            })
        });

        it('should have 5 rivets bindings', function(){
            view.render();
            // 1 & 2 - widget itself
            // 3 - widget caption showing PropertyName
            // 4 & 5 - labels indicating value with measure
            expect(view.rivets.bindings.length).toEqual(5);
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
            widget = $(element).measuredUnit();
        });

        it('should set Value to 1 by default', function(){
            expect($('input[type=text]', element)).toHaveValue('1');
        });

        it('should set data attribute to container', function(){
            expect($(element)).toHaveData('view');
        });
    });
});
