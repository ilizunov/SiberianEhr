describe("Variate Date-time Picker Widget", function () {
    describe("rendering", function () {
        var view;
        beforeEach(function(){
            view = new SiberianEHR.DateTimePicker.View({
                model : new SiberianEHR.DateTimePicker.Model({
                    format: 'YYYY-MM-??',
                    Magnitude: 63494389149.55
                })
            });
            view.render();
        });

        it("In select box year should be selected", function () {
            //Test for rivets late binding
            //Fixed rivets error #75: Improve data-value bindings on dynamic select elements
            //https://github.com/adheerajkumar/rivets/commit/ee1b0980f6417ef1bf90f543a6f649cd59a69fa6
            expect(parseInt($('select[name=Year]', view.el).val())).toEqual(2013);
        });
    });

    describe("model initialization", function(){
        var model;

        beforeEach(function(){
            model = new SiberianEHR.DateTimePicker.Model({
                format: 'YYYY-MM-??',
                Magnitude: 63494389149.55
            });
        });

        it("Should initialize model with year, month and day",function(){
            expect(model.get('Year')).toEqual(2013);
            expect(model.get('Month')).toEqual(1);
            expect(model.get('Day')).toEqual(21);
            expect(model.get('Hour')).toEqual(0);
            expect(model.get('Minute')).toEqual(0);
            expect(model.get('Second')).toEqual(0);
            expect(model.get('Millisecond')).toEqual(0);
        });
    });

    describe("model manipulation", function(){
        var model;

        beforeEach(function(){
            model = new SiberianEHR.DateTimePicker.Model({
                format: 'YYYY-MM-DD hh:mm:??',
                Magnitude: 63494389149.55
            });
        });
        it("should add one minute on adding one minute",function(){
            model.set('Minute', 1);
            expect(model.get('Minute')).toEqual(1);
        });
    });

    describe("model serialization/deserialization", function(){
        var model;

        beforeEach(function(){
            model = new SiberianEHR.DateTimePicker.Model({
                format: 'YYYY-MM-??',
                Magnitude: 63494389149.55
            });
        });

        it("Should change magnitude because some parts of date-time are ignored",function(){
            //2013-02-21
            var json = SiberianEHR.DateTimePicker.serialize(model);
            expect(json.Magnitude).toEqual(63494323200);
            expect(json.Value).toEqual('2013-02-21T00:00:00+00:00');
            expect(json.format).toEqual(model.get('format'));
            var modelCopy = SiberianEHR.DateTimePicker.deserialize(json);
            var modelCopyJSON = SiberianEHR.DateTimePicker.serialize(modelCopy);
            expect(_.isEqual(json, modelCopyJSON)).toEqual(true);
        });

    });

    /**
     * TODO tests
     * 1. Fractional seconds
     * 2. Valid/invalid dates (or delegate it to view, so user being unable to input a wrong date)
     * 3. De-serialize
     */

});
