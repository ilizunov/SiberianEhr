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

    describe("Format reader parsing",function(){
        describe("Date format peader", function(){
            var fr, format;
            beforeEach(function(){
                fr = new SiberianEHR.DateTimeFormatReader();
            });
            it("Should have only year. No constraints.",function(){
                format = fr.readDateFormat('????-XX-XXTXX:XX:XX');
                expect(format.hasYear).toEqual(true);
                expect(format.hasMonth || format.hasDay).toEqual(false);
                expect(format.isRequiredYear || format.isRequiredMonth || format.isRequiredDay).toEqual(false);
            });
            it("Should have only year. Required constraint.",function(){
                format = fr.readDateFormat('YYYY-XX-XXTXX:XX:XX');
                expect(format.hasYear).toEqual(true);
                expect(format.hasMonth || format.hasDay).toEqual(false);
                expect(format.isRequiredMonth || format.isRequiredDay).toEqual(false);
                expect(format.isRequiredYear).toEqual(true);
            });
            it("Should have year and month. Year required constraint.",function(){
                format = fr.readDateFormat('YYYY-??-XXTXX:XX:XX');
                expect(format.hasYear && format.hasMonth).toEqual(true);
                expect(format.hasDay).toEqual(false);
                expect(format.isRequiredMonth || format.isRequiredDay).toEqual(false);
                expect(format.isRequiredYear).toEqual(true);
            });
            it("Should have year and month. Both year and month required constraint.",function(){
                format = fr.readDateFormat('YYYY-MM-XXTXX:XX:XX');
                expect(format.hasYear && format.hasMonth).toEqual(true);
                expect(format.hasDay).toEqual(false);
                expect(format.isRequiredDay).toEqual(false);
                expect(format.isRequiredYear && format.isRequiredMonth).toEqual(true);
            });
            it("Should have year, month and day. Year and month required constraint, day - no constraint.",function(){
                format = fr.readDateFormat('YYYY-MM-??TXX:XX:XX');
                expect(format.hasYear && format.hasMonth && format.hasDay).toEqual(true);
                expect(format.isRequiredDay).toEqual(false);
                expect(format.isRequiredYear && format.isRequiredMonth).toEqual(true);
            });
            it("Should have year, month and day. Year, month and day required constraints.",function(){
                format = fr.readDateFormat('YYYY-MM-DDTXX:XX:XX');
                expect(format.hasYear && format.hasMonth && format.hasDay).toEqual(true);
                expect(format.isRequiredYear && format.isRequiredMonth && format.isRequiredDay).toEqual(true);
            });
        })
    });
});
