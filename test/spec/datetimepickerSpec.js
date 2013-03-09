describe("Variate Date-time Picker Widget", function () {
    describe("model initialization", function(){
        var localDateFormat, m;
        beforeEach(function(){
            m = 63494389149.55;
            localDateFormat = 'YYYY-MM-DD';
        });
        it("Should initialize model with year",function(){
            format = 'YYYY-XX-XX';
            var model = new SiberianEHR.DateTimePicker.Model({
                    Magnitude: m,
                    format: format,
                    localDateFormat: localDateFormat
                }),
                json = model.toJSON();
            expect(json.Year).toEqual(2013);
            expect(json.Month).toEqual(0);
            expect(json.Day).toEqual(1);
            expect(json.Hour).toEqual(0);
            expect(json.Minute).toEqual(0);
            expect(json.Second).toEqual(0);
            expect(json.Millisecond).toEqual(0);
            expect(model.getDateValue()).toEqual('2013');
        });
        it("Should initialize model with year and month",function(){
            format = 'YYYY-MM-XX';
            var model = new SiberianEHR.DateTimePicker.Model({
                    Magnitude: m,
                    format: format,
                    localDateFormat: localDateFormat
                }),
                json = model.toJSON();
            expect(json.Year).toEqual(2013);
            expect(json.Month).toEqual(0);
            expect(json.Day).toEqual(1);
            expect(json.Hour).toEqual(0);
            expect(json.Minute).toEqual(0);
            expect(json.Second).toEqual(0);
            expect(json.Millisecond).toEqual(0);
            expect(model.getDateValue()).toEqual('2013-01');
        });
        it("Should initialize model with year, month and day",function(){
            format = 'YYYY-MM-DD';
            var model = new SiberianEHR.DateTimePicker.Model({
                    Magnitude: m,
                    format: format,
                    localDateFormat: localDateFormat
                }),
                json = model.toJSON();
            expect(json.Year).toEqual(2013);
            expect(json.Month).toEqual(0);
            expect(json.Day).toEqual(21);
            expect(json.Hour).toEqual(0);
            expect(json.Minute).toEqual(0);
            expect(json.Second).toEqual(0);
            expect(json.Millisecond).toEqual(0);
            expect(model.getDateValue()).toEqual('2013-01-21');
        });
    });

    describe("model manipulation", function(){});

    describe("model serialization/deserialization", function(){});

    describe("Format reader parsing",function(){});
});
