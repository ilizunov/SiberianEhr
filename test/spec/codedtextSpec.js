/**
 * Examples:
 * http://tinnedfruit.com/2011/03/03/testing-backbone-apps-with-jasmine-sinon.html
 * http://net.tutsplus.com/tutorials/javascript-ajax/building-and-testing-a-backbone-app/
 */
describe("Coded text widget", function () {
    describe("data model", function () {
        var model;

        beforeEach(function () {
            model = new SiberianEHR.CodedText.CodedTextModel({
                Dictionary: [{id:'id1', text:'text1'},{id:'id2', text:'text2'}]
            });
        });

        it("should contain 2 key-value pairs", function () {
            expect(model.get('Dictionary').length).toEqual(2);
        });

        it("should get the right text according to its id", function(){
            model.set('Value', 'id1');
            expect(model.get('Value')).toEqual('id1');
            expect(model.getTextById(model.get('Value'))).toEqual('text1');
            model.set('Value', 'id2');
            expect(model.getTextById()).toEqual('text2');
        })

    });

    describe('data model serialization-deserialization',function(){
        var model;

        beforeEach(function () {
            model = new SiberianEHR.CodedText.CodedTextModel({
                Dictionary: [{id:'id1', text:'text1'},{id:'id2', text:'text2'}],
                Required: true,
                Value: 'id2',
                AssumedValue: 'id1'
            });
        });

        it("should get equal json from original model and deserialized one", function(){
            var json = SiberianEHR.CodedText.serialize(model);
            var newModel = new SiberianEHR.CodedText.deserialize(json);
            var newJson = SiberianEHR.CodedText.serialize(newModel);
            expect(_.isEqual(json, newJson)).toBeTruthy();
        });
    });

    describe("View rendering", function(){
        var element = $('<div id="container"></div>'), options, widget;

        beforeEach(function(){
            options = {
                Dictionary: [{id:'id1', text:'text1'},{id:'id2', text:'text2'}],
                Required: true,
                Value: 'id2',
                AssumedValue: 'id1'
            };
            $(element).codedText(options);
            widget = $(element).codedText('widget');
        });

        it('should set text according to selected value as input text', function(){
            expect($(element).find('.select2-choice span').text()).toEqual('text2');
        });

        it('should set assumed value to input', function(){
            widget.clearValue();
            expect($(element).find('.select2-default span').text()).toEqual('text1');
        });

        it('manual input selection', function(){
            //TODO
        });
    });

    describe("model validation", function () {
        var model, foo, options;
        beforeEach(function () {
            options = {
                Dictionary: [{id:'id1', text:'text1'},{id:'id2', text:'text2'}],
                Required: true,
                Value: 'id2',
                AssumedValue: 'id1'
            };
            foo = {
                invalid_handler : function(){
                    return;
                },
                valid_handler: function(){
                    return;
                }
            };
            spyOn(foo, 'invalid_handler');
            spyOn(foo, 'valid_handler');

        });

        it("Should be error on empty value", function () {
            model = new SiberianEHR.CodedText.CodedTextModel(options);
            model.on('invalid', foo.invalid_handler, model);
            model.set({Value: ''});
            expect(foo.invalid_handler).toHaveBeenCalled();
        });

        it("Should not be error on empty value, because field is not required", function () {
            options.Required = false;
            model = new SiberianEHR.CodedText.CodedTextModel(options);
            model.on('valid', foo.valid_handler, model);
            model.set({Value: ''});
            expect(foo.valid_handler).toHaveBeenCalled();
        });
    });

    describe("Value serialization/deserialization. JQuery plugin notation.", function(){
        var element = $('<div id="container"></div>'), options;

        beforeEach(function(){
            options = {
                Dictionary: [{id:'id1', text:'text1'},{id:'id2', text:'text2'}],
                Value: 'id2'
            };
            element.codedText(options);
        });

        it("should read value of widget as json",function(){
            var json = element.codedText('value');
            expect(json.Value).toEqual('id2');
        });

        it("should write value (json) to widget",function(){
            var json = element.measuredUnit('value');
            json.Value = 'id1';
            element.measuredUnit('value', json);
            json = element.measuredUnit('value');
            expect(json.Value).toEqual('id1');
        });
    });

    describe("Value serialization/deserialization. Twitter plugin notation.", function(){
        var element = $('<div id="container"></div>'),
            widget, options;

        beforeEach(function(){
            options = {
                Dictionary: [{id:'id1', text:'text1'},{id:'id2', text:'text2'}],
                Value: 'id2'
            };
            element.codedText(options);
            widget = element.measuredUnit('widget');
        });

        it("should read value of widget as json",function(){
            var json = widget.value();
            expect(json.Value).toEqual('id2');
        });

        it("should write value (json) to widget",function(){
            var json = widget.value();
            json.Value = 'id1';
            widget.value(json);
            json = widget.value();
            expect(json.Value).toEqual('id1');
        });
    });
});
