describe("Variate Date-time Picker Widget", function () {
    describe("model initialization", function(){
        var format, m;
        beforeEach(function(){
            format = {
                hasCentury: false, isRequiredCentury: false,
                hasYear: false, isRequiredYear: false,
                hasMonth: false, isRequiredMonth: false,
                hasDay: false, isRequiredDay: false,
                hasHour: false, isRequiredHour: false,
                hasMinute: false, isRequiredMinute: false,
                hasSecond: false, isRequiredSecond: false,
                hasMillisecond: false, isRequiredMillisecond: false,
                hasTimeZone: false, isRequiredTimeZone: false,
                dateFormat: '', timeFormat: ''
            };
            m = 63494389149.55;
        });
        it("Should initialize model with year",function(){
            format.dateFormat = 'YYYY';
            format.hasYear = true;
            var model = new SiberianEHR.DateTimePicker.Model({
                Magnitude: m,
                format: format
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
            format.dateFormat = 'YYYY-MM';
            format.hasYear = format.hasMonth = true;
            var model = new SiberianEHR.DateTimePicker.Model({
                    Magnitude: m,
                    format: format
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
            format.dateFormat = 'YYYY-MM-DD';
            format.hasYear = format.hasMonth = format.hasDay = true;
            var model = new SiberianEHR.DateTimePicker.Model({
                    Magnitude: m,
                    format: format
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
        it("Should initialize model with year, month, day and hour",function(){
            format.dateFormat = 'YYYY-MM-DD';
            format.timeFormat = 'HH';
            format.hasYear = format.hasMonth = format.hasDay = true;
            format.hasHour = true;
            var model = new SiberianEHR.DateTimePicker.Model({
                    Magnitude: m,
                    format: format
                }),
                json = model.toJSON();
            expect(json.Year).toEqual(2013);
            expect(json.Month).toEqual(0);
            expect(json.Day).toEqual(21);
            expect(json.Hour).toEqual(18);
            expect(json.Minute).toEqual(0);
            expect(json.Second).toEqual(0);
            expect(json.Millisecond).toEqual(0);
            expect(model.getDateValue()).toEqual('2013-01-21');
            expect(model.getTimeValue()).toEqual('18');
        });
        it("Should initialize model with year, month, day, hour & minute",function(){
            format.dateFormat = 'YYYY-MM-DD';
            format.timeFormat = 'HH:mm';
            format.hasYear = format.hasMonth = format.hasDay = true;
            format.hasHour = format.hasMinute = true;
            var model = new SiberianEHR.DateTimePicker.Model({
                    Magnitude: m,
                    format: format
                }),
                json = model.toJSON();
            expect(json.Year).toEqual(2013);
            expect(json.Month).toEqual(0);
            expect(json.Day).toEqual(21);
            expect(json.Hour).toEqual(18);
            expect(json.Minute).toEqual(19);
            expect(json.Second).toEqual(0);
            expect(json.Millisecond).toEqual(0);
            expect(model.getDateValue()).toEqual('2013-01-21');
            expect(model.getTimeValue()).toEqual('18:19');
        });
        it("Should initialize model with year, month, day, hour, minute and second",function(){
            format.dateFormat = 'YYYY-MM-DD';
            format.timeFormat = 'HH:mm:ss';
            format.hasYear = format.hasMonth = format.hasDay = true;
            format.hasHour = format.hasMinute = format.hasSecond = true;
            var model = new SiberianEHR.DateTimePicker.Model({
                    Magnitude: m,
                    format: format
                }),
                json = model.toJSON();
            expect(json.Year).toEqual(2013);
            expect(json.Month).toEqual(0);
            expect(json.Day).toEqual(21);
            expect(json.Hour).toEqual(18);
            expect(json.Minute).toEqual(19);
            expect(json.Second).toEqual(9);
            expect(json.Millisecond).toEqual(0);
            expect(model.getDateValue()).toEqual('2013-01-21');
            expect(model.getTimeValue()).toEqual('18:19:09');
        });
    });

    describe("model manipulation", function(){});

    describe("model serialization/deserialization", function(){});

    describe("Format reader parsing",function(){});
});
