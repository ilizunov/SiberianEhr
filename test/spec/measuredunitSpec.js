/**
 * Examples:
 * http://tinnedfruit.com/2011/03/03/testing-backbone-apps-with-jasmine-sinon.html
 * http://net.tutsplus.com/tutorials/javascript-ajax/building-and-testing-a-backbone-app/
 */
describe("Measured Unit widget", function () {
    describe("data model", function () {
        var model;

        beforeEach(function () {
            model = new SiberianEHR.MeasuredUnit();
        });

        it("should convert from kg to tonns", function () {
            model.set({Value: 1500, Unit: 'кг'});
            model.set('Unit', 'т');
            expect(model.get('Value')).toEqual(1.5);
        });

        it("should convert from tonns to kg", function () {
            model.set({Value: 1, Unit: 'т'});
            model.set('Unit', 'кг');
            expect(model.get('Value')).toEqual(1000);
        });
    });

    describe("rendering", function(){
        var view;
        beforeEach(function(){
            view = new SiberianEHR.MeasuredUnitView({
                model: new SiberianEHR.MeasuredUnit({
                    Value: 30,
                    Unit: 'кг'
                })
            })
        });

        it('should have 2 rivets bindings', function(){
            view.render();
            expect(view.rivets.bindings.length).toEqual(2);
        });

        it('should set value to input', function(){
            view.render();
            expect($('input[type=text]', view.el)).toHaveValue('30');
        });

        it('should select Unit automatically', function(){
            view.render();
            expect($('option[value=кг]', view.el)).toBeSelected();
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
